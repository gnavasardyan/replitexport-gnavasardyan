import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { 
  deviceFormSchema, 
  InsertDevice, 
  DeviceResponse,
  DeviceStatusOptions, 
  LicenseResponse, 
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

interface DeviceFormProps {
  device?: DeviceResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeviceForm({ device, onClose, onSuccess }: DeviceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenses, setLicenses] = useState<{ id: number; license_key: string }[]>([]);
  const [clients, setClients] = useState<{ id: number; client_name: string }[]>([]);
  
  useEffect(() => {
    // Загружаем список лицензий и клиентов для селекта
    const fetchData = async () => {
      try {
        const licensesResponse = await API.licenses.getAll();
        setLicenses(licensesResponse.map(l => ({ id: l.id, license_key: l.license_key })));
        
        const clientsResponse = await API.clients.getAll();
        setClients(clientsResponse.map(c => ({ id: c.id, client_name: c.client_name })));
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить необходимые данные",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [toast]);
  
  const defaultValues = device
    ? { 
        status: device.status,
        client_id: device.client_id,
        license_id: device.license_id,
        inst_id: device.inst_id,
        os_version: device.os_version,
        local_id: device.local_id
      }
    : {
        client_id: undefined,
        license_id: undefined,
        inst_id: "",
        os_version: "",
        local_id: "",
        status: "not_configured" as string
      };

  const form = useForm({
    resolver: zodResolver(deviceFormSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDevice) => API.devices.create(data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Устройство успешно создано",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/devices"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать устройство: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ device_id, data }: { device_id: number; data: Partial<DeviceResponse> }) => API.devices.update(device_id, data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Устройство успешно обновлено",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/devices"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить устройство: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertDevice) => {
    setIsSubmitting(true);
    
    // Защита от null в поле status
    const formattedData = {
      ...data,
      status: data.status || "not_configured"
    };
    
    if (device) {
      updateMutation.mutate({ device_id: device.device_id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
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
          name="license_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Лицензия*</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите лицензию" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {licenses.map((license) => (
                    <SelectItem key={license.id} value={license.id.toString()}>
                      {license.license_key}
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
          name="inst_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID установки*</FormLabel>
              <FormControl>
                <Input placeholder="Введите ID установки" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="os_version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Версия ОС*</FormLabel>
              <FormControl>
                <Input placeholder="Введите версию ОС" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={form.control}
          name="local_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Локальный ID*</FormLabel>
              <FormControl>
                <Input placeholder="Введите локальный ID" {...field} />
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
              <FormLabel>Статус устройства*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DeviceStatusOptions.map((option) => (
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
            {isSubmitting ? "Сохранение..." : device ? "Обновить устройство" : "Добавить устройство"}
          </Button>
        </div>
      </form>
    </Form>
  );
}