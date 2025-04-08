import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { 
  licenseFormSchema, 
  InsertLicense, 
  LicenseResponse,
  LicenseStatusOptions, 
  ClientResponse 
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

interface LicenseFormProps {
  license?: LicenseResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function LicenseForm({ license, onClose, onSuccess }: LicenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<{ id: number; client_name: string }[]>([]);
  
  useEffect(() => {
    // Загружаем список клиентов для селекта
    const fetchClients = async () => {
      try {
        const response = await API.clients.getAll();
        setClients(response.map(c => ({ id: c.id, client_name: c.client_name })));
      } catch (error) {
        console.error("Ошибка при загрузке клиентов:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список клиентов",
          variant: "destructive",
        });
      }
    };
    
    fetchClients();
  }, [toast]);
  
  const defaultValues = license
    ? { ...license }
    : {
        client_id: undefined,
        license_key: "",
        status: "AVAIL"
      };

  const form = useForm({
    resolver: zodResolver(licenseFormSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertLicense) => API.licenses.create(data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Лицензия успешно создана",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/licenses"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать лицензию: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LicenseResponse> }) => API.licenses.update(id, data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Лицензия успешно обновлена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/licenses"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить лицензию: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertLicense) => {
    setIsSubmitting(true);
    
    if (license) {
      updateMutation.mutate({ id: license.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Клиент*</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.client_name}
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
          name="license_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Лицензионный ключ*</FormLabel>
              <FormControl>
                <Input placeholder="Введите лицензионный ключ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус лицензии*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LicenseStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
            {isSubmitting ? "Сохранение..." : license ? "Обновить лицензию" : "Добавить лицензию"}
          </Button>
        </div>
      </form>
    </Form>
  );
}