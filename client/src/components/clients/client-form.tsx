import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { 
  clientFormSchema, 
  InsertClient, 
  ClientResponse, 
  PartnerResponse 
} from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
  client?: ClientResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClientForm({ client, onClose, onSuccess }: ClientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partners, setPartners] = useState<{ id: number; partner_name: string }[]>([]);
  
  useEffect(() => {
    // Загружаем список партнеров для селекта
    const fetchPartners = async () => {
      try {
        const response = await API.partners.getAll();
        setPartners(response.map(p => ({ id: p.partner_id, partner_name: p.partner_name })));
      } catch (error) {
        console.error("Ошибка при загрузке партнеров:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список партнеров",
          variant: "destructive",
        });
      }
    };
    
    fetchPartners();
  }, [toast]);
  
  const defaultValues = client
    ? { ...client }
    : {
        partner_id: undefined,
        client_name: "",
        inn: "",
        type: "COMPANY"
      };

  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertClient) => API.clients.create(data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Клиент успешно создан",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/clients"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать клиента: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientResponse> }) => API.clients.update(id, data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Клиент успешно обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/clients"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить клиента: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertClient) => {
    setIsSubmitting(true);
    
    if (client) {
      const clientId = client.client_id;
      updateMutation.mutate({ id: clientId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="partner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Партнер*</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите партнера" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.partner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Наименование клиента*</FormLabel>
              <FormControl>
                <Input placeholder="Введите наименование клиента" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ИНН*</FormLabel>
              <FormControl>
                <Input placeholder="Введите ИНН клиента" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип клиента*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип клиента" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COMPANY">COMPANY</SelectItem>
                  <SelectItem value="REGISTRY">REGISTRY</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : client ? "Обновить клиента" : "Добавить клиента"}
          </Button>
        </div>
      </form>
    </Form>
  );
}