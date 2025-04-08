import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { partnerFormSchema, InsertPartner, PartnerResponse } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PartnerFormProps {
  partner?: PartnerResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function PartnerForm({ partner, onClose, onSuccess }: PartnerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues = partner
    ? { ...partner }
    : {
        partner_name: "",
        inn: "",
        kpp: "",
        ogrn: "",
        address: "",
        email: "",
        apitoken: "",
        type: "provider",
        status: "active",
      };

  const form = useForm({
    resolver: zodResolver(partnerFormSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPartner) => API.partners.create(data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Партнер успешно создан",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/partners"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать партнера: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PartnerResponse> }) => API.partners.update(id, data),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Партнер успешно обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/partners"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить партнера: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertPartner) => {
    setIsSubmitting(true);
    
    if (partner) {
      updateMutation.mutate({ id: partner.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="partner_name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Наименование партнера*</FormLabel>
                <FormControl>
                  <Input placeholder="Введите наименование партнера" {...field} />
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
                  <Input placeholder="Введите ИНН" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kpp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>КПП*</FormLabel>
                <FormControl>
                  <Input placeholder="Введите КПП" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ogrn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ОГРН*</FormLabel>
                <FormControl>
                  <Input placeholder="Введите ОГРН" {...field} />
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
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Адрес*</FormLabel>
                <FormControl>
                  <Textarea placeholder="Полный адрес" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apitoken"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>API токен*</FormLabel>
                <FormControl>
                  <Input placeholder="Введите API токен" {...field} />
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
                <FormLabel>Тип партнера</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="provider">Провайдер</SelectItem>
                    <SelectItem value="distributor">Дистрибьютор</SelectItem>
                    <SelectItem value="reseller">Реселлер</SelectItem>
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
                <FormLabel>Статус</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="inactive">Неактивный</SelectItem>
                    <SelectItem value="suspended">Приостановлен</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            {isSubmitting ? "Сохранение..." : partner ? "Обновить партнера" : "Добавить партнера"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
