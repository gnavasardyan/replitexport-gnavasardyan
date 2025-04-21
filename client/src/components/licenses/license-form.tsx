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
  onSuccess: () => void;
  clients?: ClientResponse[];
}

export function LicenseForm({ license, onClose, onSuccess, clients = [] }: LicenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = license
    ? { 
        client_id: license.client_id.toString(),
        license_key: license.license_key,
        status: license.status || "AVAIL"
      }
    : {
        client_id: "",
        license_key: "",
        status: "AVAIL"
      };

  const form = useForm({
    resolver: zodResolver(licenseFormSchema),
    defaultValues,
    mode: "onChange"
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertLicense) => {
      // Преобразуем данные перед отправкой
      const postData = {
        client_id: parseInt(data.client_id),
        license_key: data.license_key,
        status: data.status
      };
      return API.licenses.create(postData);
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Лицензия успешно создана",
      });
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать лицензию",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LicenseResponse> }) => {
      const putData = {
        client_id: parseInt(data.client_id as string),
        license_key: data.license_key,
        status: data.status
      };
      return API.licenses.update(id, putData);
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Лицензия успешно обновлена",
      });
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить лицензию",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: InsertLicense) => {
    setIsSubmitting(true);
    
    try {
      if (license) {
        await updateMutation.mutateAsync({ 
          id: license.id, 
          data 
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Ошибка при сохранении лицензии:", error);
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
                onValueChange={field.onChange}
                value={field.value}
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
                    <SelectItem 
                      key={status.value} 
                      value={status.value}
                    >
                      {status.label}
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
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Сохранение..." : license ? "Обновить лицензию" : "Добавить лицензию"}
          </Button>
        </div>
      </form>
    </Form>
  );
}