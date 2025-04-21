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

export default function Licenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddLicense, setOpenAddLicense] = useState(false);
  const [openEditLicense, setOpenEditLicense] = useState(false);
  const [openDeleteLicense, setOpenDeleteLicense] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseResponse | null>(null);

  // Fetch licenses and clients
  const { data: licenses, isLoading: isLoadingLicenses, error: licensesError } = useQuery({
    queryKey: ["licenses"],
    queryFn: API.licenses.getAll,
  });

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ["clients"],
    queryFn: API.clients.getAll,
  });

  // Mutations
  const createLicenseMutation = useMutation({
    mutationFn: (data: { client_id: number; license_key: string; status: string }) => 
      API.licenses.create(data),
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

  const updateLicenseMutation = useMutation({
    mutationFn: (data: LicenseResponse) => API.licenses.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast({
        title: "Успех",
        description: "Лицензия успешно обновлена",
      });
      setOpenEditLicense(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить лицензию",
        variant: "destructive",
      });
    },
  });

  // Исправленная мутация для удаления
  const deleteLicenseMutation = useMutation({
    mutationFn: (license_id: number) => API.licenses.delete(license_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast({
        title: "Успех",
        description: "Лицензия успешно удалена",
      });
      setOpenDeleteLicense(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить лицензию",
        variant: "destructive",
      });
    },
  });

  const getClientName = (clientId: number) => {
    if (!clients) return clientId.toString();
    const client = clients.find((c: ClientResponse) => c.client_id === clientId);
    return client ? client.client_name : clientId.toString();
  };

  const handleAddLicense = () => {
    setOpenAddLicense(true);
  };

  const handleEditLicense = (license: LicenseResponse) => {
    setSelectedLicense(license);
    setOpenEditLicense(true);
  };

  const handleDeleteLicense = (license: LicenseResponse) => {
    setSelectedLicense(license);
    setOpenDeleteLicense(true);
  };

  // Исправленный обработчик подтверждения удаления
  const handleConfirmDelete = () => {
    if (selectedLicense) {
      deleteLicenseMutation.mutate(selectedLicense.id);
    }
  };

  const handleViewLicense = (license: LicenseResponse) => {
    const clientName = getClientName(license.client_id);
    toast({
      title: "Информация о лицензии",
      description: `Ключ: ${license.license_key}, Клиент: ${clientName}, Статус: ${license.status || "Не указан"}`,
    });
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  const getLicenseBadge = (status: string | undefined) => {
    if (!status) return { variant: "outline" as const, className: "", label: "Нет статуса" };
    
    switch (status) {
      case "AVAIL":
        return { variant: "default" as const, className: "bg-green-500", label: "Доступна" };
      case "USED":
        return { variant: "outline" as const, className: "bg-blue-500 text-white", label: "Используется" };
      case "BLOCKED":
        return { variant: "outline" as const, className: "bg-red-500 text-white", label: "Заблокирована" };
      default:
        return { variant: "outline" as const, className: "", label: status };
    }
  };

  const isLoading = isLoadingLicenses || isLoadingClients;
  const error = licensesError || clientsError;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
          {/* ... (остальной интерфейс без изменений) ... */}

          {/* Delete License Dialog */}
          <Dialog open={openDeleteLicense} onOpenChange={setOpenDeleteLicense}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить лицензию</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Вы уверены, что хотите удалить эту лицензию?</p>
                {selectedLicense && (
                  <>
                    <p className="font-bold font-mono">{selectedLicense.license_key}</p>
                    <p><span className="font-medium">Клиент:</span> {getClientName(selectedLicense.client_id)}</p>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpenDeleteLicense(false)}>
                  Отмена
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmDelete}
                  disabled={deleteLicenseMutation.isPending}
                >
                  {deleteLicenseMutation.isPending ? "Удаление..." : "Удалить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}