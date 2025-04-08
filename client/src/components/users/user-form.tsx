import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/api";
import { InsertUser, UserResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Определяем схему валидации формы
const userFormSchema = z.object({
  email: z.string().email({
    message: "Укажите корректный email адрес",
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать не менее 6 символов",
  }),
  last_logon_time: z.date().optional(),
  status: z.enum(["ACTIVE", "CREATED", "CONFIRMED"], {
    required_error: "Выберите статус пользователя",
  }),
  partner_id: z.number({
    required_error: "Выберите партнера",
  }),
  role: z.enum(["admin", "user"], {
    required_error: "Выберите роль пользователя",
  }),
  client_id: z.number({
    required_error: "Выберите клиента",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: UserResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partners, setPartners] = useState<{ id: number; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);

  // Загружаем список партнеров и клиентов для селектов
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await API.partners.getAll();
        setPartners(response);
      } catch (error) {
        console.error("Ошибка при загрузке партнеров:", error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await API.clients.getAll();
        setClients(response);
      } catch (error) {
        console.error("Ошибка при загрузке клиентов:", error);
      }
    };

    fetchPartners();
    fetchClients();
  }, []);

  // Инициализируем форму с дефолтными значениями
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      password: "", // Не показываем пароль даже при редактировании
      last_logon_time: user?.last_logon_time ? new Date(user.last_logon_time) : undefined,
      status: user?.status || "CREATED",
      partner_id: user?.partner_id,
      role: user?.role || "user",
      client_id: user?.client_id,
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Преобразуем данные для API
      const userData: InsertUser = {
        email: data.email,
        password: data.password,
        role: data.role || "user",
        status: data.status || "CREATED",
        partner_id: Number(data.partner_id),
        client_id: Number(data.client_id),
      };

      // Дополнительные поля для API
      const apiData = {
        ...userData,
        status: data.status,
        partner_id: Number(data.partner_id),
        client_id: Number(data.client_id),
      };

      let response;
      if (user) {
        // Обновление существующего пользователя
        response = await apiRequest("PUT", `/api/v1/users/${user.user_id}`, apiData);
      } else {
        // Создание нового пользователя
        response = await API.users.create(userData);
      }

      // Инвалидируем кеш запросов пользователей
      queryClient.invalidateQueries({ queryKey: ["/api/v1/users"] });

      toast({
        title: user ? "Пользователь обновлен" : "Пользователь создан",
        description: `Пользователь успешно ${user ? "обновлен" : "создан"}.`,
      });

      onSuccess();
    } catch (error) {
      console.error("Ошибка при сохранении пользователя:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить пользователя. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input placeholder="Введите email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль*</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Введите пароль" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input placeholder="Введите email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Роль*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Активный</SelectItem>
                  <SelectItem value="CREATED">Создан</SelectItem>
                  <SelectItem value="CONFIRMED">Подтвержден</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="partner_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Партнер</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value === "0" ? undefined : parseInt(value));
                  }}
                  value={field.value?.toString() || "0"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите партнера" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Не выбрано</SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.partner_id} value={partner.partner_id.toString()}>
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
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Клиент</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "0" ? undefined : parseInt(value))} 
                  value={field.value?.toString() || "0"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Не выбрано</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.client_id} value={client.client_id.toString()}>
                        {client.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : user ? "Обновить" : "Создать"}
          </Button>
        </div>
      </form>
    </Form>
  );
}