import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LicenseResponse, ClientResponse } from "@shared/schema";
import { API } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Схема валидации формы
const licenseFormSchema = z.object({
  license_key: z.string().min(1, "Обязательное поле"),
  client_id: z.string().min(1, "Выберите клиента"),
  status: z.enum(["AVAIL", "USED", "BLOCKED"]),
  issuedDate: z.string().optional(),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;

interface LicenseFormProps {
  license?: LicenseResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function LicenseForm({ license, onClose, onSuccess }: LicenseFormProps) {
  const { toast } = useToast();

  // Получаем список клиентов
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/v1/clients"],
    queryFn: API.clients.getAll,
  });

  // Подготавливаем опции для выпадающего списка клиентов
  const clientOptions = clients?.map((client: ClientResponse) => ({
    label: client.client_name,
    value: client.client_id.toString(),
  })) || [];

  // Инициализация формы
  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      license_key: license?.license_key || "",
      client_id: license?.client_id?.toString() || "",
      status: license?.status || "AVAIL",
      issuedDate: license?.issuedDate?.toString() || "",
    },
  });

  // Обработчик отправки формы
  const onSubmit = async (values: LicenseFormValues) => {
    try {
      if (license) {
        // Редактирование существующей лицензии
        await API.licenses.update(license.id, {
          ...values,
          client_id: parseInt(values.client_id),
        });
        toast({
          title: "Успех",
          description: "Лицензия успешно обновлена",
        });
      } else {
        // Создание новой лицензии
        await API.licenses.create({
          ...values,
          client_id: parseInt(values.client_id),
        });
        toast({
          title: "Успех",
          description: "Лицензия успешно создана",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Произошла ошибка",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Поле для ключа лицензии */}
        <FormField
          control={form.control}
          name="license_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ключ лицензии</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Введите ключ лицензии" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Выбор клиента */}
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Клиент</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingClients ? (
                    <SelectItem value="" disabled>
                      Загрузка клиентов...
                    </SelectItem>
                  ) : clientOptions.length === 0 ? (
                    <SelectItem value="" disabled>
                      Нет доступных клиентов
                    </SelectItem>
                  ) : (
                    clientOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Статус лицензии */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AVAIL">Доступна</SelectItem>
                  <SelectItem value="USED">Используется</SelectItem>
                  <SelectItem value="BLOCKED">Заблокирована</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Дата выдачи (опционально) */}
        <FormField
          control={form.control}
          name="issuedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата выдачи</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Кнопки формы */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">
            {license ? "Сохранить изменения" : "Создать лицензию"}
          </Button>
        </div>
      </form>
    </Form>
  );
}