import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { 
  licenseFormSchema, 
  InsertLicense, 
  LicenseResponse, 
  ClientResponse,
  LicenseStatusOptions 
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
  onSuccess?: () => void;
}

export function LicenseForm({ license, onClose, onSuccess }: LicenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [originalLicense, setOriginalLicense] = useState<LicenseResponse | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await API.clients.getAll();
        setClients(response);
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

    // Сохраняем исходные данные лицензии
    if (license) {
      setOriginalLicense({...license});
    }
  }, [toast, license]);

  const defaultValues = license
    ? { 
        client_id: license.client_id,
        license_key: license.license_key,
        status: license.status || "AVAIL"
      }
    : {
        client_id: undefined,
        license_key: "",
        status: "AVAIL"
      };

  const form = useForm({
    resolver: zodResolver(licenseFormSchema),
    defaultValues,
  });

  const handleSuccess = () => {
    toast({
      title: "Успех",
      description: license ? "Лицензия успешно обновлена" : "Лицензия успешно создана",
    });
    queryClient.invalidateQueries({ queryKey: ["licenses"] });
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertLicense) => {
      const postData = {
        client_id: Number(data.client_id),
        license_key: data.license_key,
        status: data.status
      };
      return API.licenses.create(postData);
    },
    onSuccess: handleSuccess,
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
    mutationFn: ({ id, data }: { id: number; data: Partial<LicenseResponse> }) => {
      return API.licenses.update(id, {
        client_id: Number(data.client_id),
        license_key: data.license_key,
        status: data.status
      });
    },
    onSuccess: handleSuccess,
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
        {/* Показываем ID лицензии при редактировании */}
        {license && (
          <div className="text-sm text-gray-500">
            ID лицензии: {license.id}
          </div>
        )}

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Клиент*</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem 
                      key={client.client_id} 
                      value={client.client_id.toString()}
                    >
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
              <FormLabel>Ключ лицензии*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Введите ключ лицензии" 
                  {...field} 
                  disabled={isSubmitting}
                />
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
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус лицензии" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LicenseStatusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Показываем исходные данные при редактировании */}
        {license && originalLicense && (
          <div className="text-sm text-gray-500 space-y-1">
            <div>Исходный клиент: {clients.find(c => c.client_id === originalLicense.client_id)?.client_name || originalLicense.client_id}</div>
            <div>Исходный ключ: {originalLicense.license_key}</div>
            <div>Исходный статус: {originalLicense.status}</div>
          </div>
        )}

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