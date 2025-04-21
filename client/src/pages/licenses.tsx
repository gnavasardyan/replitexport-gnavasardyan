import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { LicenseResponse, ClientResponse } from "@shared/schema";
import { LicenseForm } from "@/components/licenses/license-form";
import { Sidebar } from "@/components/layout/sidebar";
import { z } from "zod";

// Схема валидации для создания лицензии
const licenseCreateSchema = z.object({
  client_id: z.string().min(1, "Выберите клиента"),
  license_key: z.string().min(1, "Ключ лицензии обязателен"),
  status: z.string().default("AVAIL")
});

export default function Licenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddLicense, setOpenAddLicense] = useState(false);

  // Мутация для создания лицензии
  const createLicenseMutation = useMutation({
    mutationFn: (data: { client_id: string; license_key: string; status: string }) => {
      return fetch('api/v1/licenses/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Ошибка создания лицензии');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast({
        title: "Успех",
        description: "Лицензия успешно создана",
      });
      setOpenAddLicense(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать лицензию",
        variant: "destructive",
      });
    },
  });

  // Остальной код компонента...

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
          {/* ... */}

          {/* Диалог добавления лицензии */}
          <Dialog open={openAddLicense} onOpenChange={setOpenAddLicense}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новую лицензию</DialogTitle>
                <DialogDescription>
                  Заполните информацию для создания новой лицензии
                </DialogDescription>
              </DialogHeader>
              <LicenseForm 
                clients={clients || []}
                onSubmit={(data) => {
                  try {
                    const validatedData = licenseCreateSchema.parse(data);
                    createLicenseMutation.mutate(validatedData);
                  } catch (error) {
                    toast({
                      title: "Ошибка",
                      description: "Проверьте правильность введенных данных",
                      variant: "destructive",
                    });
                  }
                }}
                onClose={() => setOpenAddLicense(false)}
                isLoading={createLicenseMutation.isPending}
                initialValues={{
                  client_id: "",
                  license_key: "",
                  status: "AVAIL"
                }}
              />
            </DialogContent>
          </Dialog>

          {/* ... */}
        </div>
      </main>
    </div>
  );
}