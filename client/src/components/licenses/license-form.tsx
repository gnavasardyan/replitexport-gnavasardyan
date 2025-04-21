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
} from "@shared/schema";
import { ClientResponse } from "@shared/schema";
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
  clients: ClientResponse[];
  onSuccess: () => void;
}

export function LicenseForm({ license, clients, onClose, onSuccess }: LicenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleClientChange = (clientId: number) => setSelectedClientId(clientId);


  const clientOptions = clients.map((client) => ({
    label: client.client_name,
    value: client.client_id,
  }));

  const defaultValues = license
    ? { ...license }
    : {      
      license_key: "",
      status: "AVAIL",
      };

  const form = useForm({
    resolver: zodResolver(licenseFormSchema),
    defaultValues,
    mode: "onChange"
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
        description: `Не удалось создать лицензию`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ license_id, data }: { license_id: number; data: Partial<LicenseResponse> }) => API.licenses.update(license_id, data),
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
        description: `Не удалось обновить лицензию`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertLicense) => {
    setIsSubmitting(true);

    const selectedClient = clientOptions.find(c => c.label === form.getValues("client_name"))
    if (selectedClient === undefined) {
      toast({
        title: "Ошибка",
        description: `Не выбран клиент`,
        variant: "destructive",
      });
    } else {
      if (license?.license_id ) {        
        updateMutation.mutate({ license_id: license.license_id, data: {license_key: data.license_key, status: data.status, client_id: selectedClient.value} });
      } else {
        createMutation.mutate({...data, client_id: selectedClient.value });
      }
    }    
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {license?.license_id && (
          <FormField
            control={form.control}           
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Клиент:</FormLabel>
                <Select onValueChange={(value) => {
                  
                  field.onChange(value)
                }} 
                defaultValue={clientOptions.find(c => c.value === license.client_id)?.label}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>                    
                  </FormControl>                  
                  <SelectContent>
                  {clientOptions.map((item: { label: string; value: number }) => (
                      <SelectItem key={item.value} value={String(item.value)}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  <FormMessage />
                </Select>                
              </FormItem>
            )}
          />
        )}

        {!license && clientOptions && (
          <FormField
            control={form.control}           
            name="client_name"
            render={({ field }) => (
              <FormItem>                
                <FormLabel>Клиент:</FormLabel>
                <Select onValueChange={(value) => {
                  
                  field.onChange(value)
                }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>                    
                   </FormControl>
                   <SelectContent>
                    {clientOptions.map((item: { label: string; value: number }) => (
                        <SelectItem key={item.value} value={item.label}>
                          {item.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                <FormMessage />                
                </Select>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="license_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ключ лицензии*</FormLabel>
              <FormControl>
                <Input placeholder="Введите ключ лицензии" {...field} />
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