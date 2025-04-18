import { ClientResponse } from "@/../shared/schema";
import { DeleteLicenseDialog } from "@/components/licenses/delete-license-dialog";
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
import { LicenseResponse } from "@shared/schema";
import { LicenseForm } from "@/components/licenses/license-form";

import { Sidebar } from "@/components/layout/sidebar";

export default function Licenses() {

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddLicense, setOpenAddLicense] = useState(false);
  const [openEditLicense, setOpenEditLicense] = useState(false);
  const [openDeleteLicense, setOpenDeleteLicense] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseResponse | null>(null);

  // Fetch licenses
  const { data: licenses, isLoading, error } = useQuery({
    queryKey: ["/api/v1/licenses"],
    queryFn: API.licenses.getAll,
  });

  //Fetch clients
  const { data: clients, isLoading: isClientsLoading, error: clientsError} = useQuery({
    queryKey: ["/api/v1/clients"],
    queryFn: API.clients.getAll
  })

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

  const handleViewLicense = (license: LicenseResponse) => {
    toast({
      title: "Информация о лицензии",
      description: `${license.license_key} (${license.status || "Статус не указан"})`,
    });
  };

  // Format date string to readable format
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Get status badge styling based on license status
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Лицензии</h1>
        <Button onClick={handleAddLicense} className="gap-2">
          <Plus size={16} />
          Добавить лицензию
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все лицензии</TabsTrigger>
          <TabsTrigger value="avail">Доступные</TabsTrigger>
          <TabsTrigger value="used">Используемые</TabsTrigger>
          <TabsTrigger value="blocked">Заблокированные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка лицензий...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : !licenses || licenses.length === 0 ? (
            <div className="text-center py-8">Нет данных о лицензиях</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {licenses.map((license: LicenseResponse) => {
                const badgeInfo = getLicenseBadge(license.status);
                
                return (
                  <Card key={license.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-mono">{license.license_key}</CardTitle>
                        <Badge 
                          variant={badgeInfo.variant}
                          className={badgeInfo.className}
                        >
                          {badgeInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">ID лицензии:</span> {license.license_id}</p>
                        <p><span className="font-medium">ID клиента:</span> {license.client_id}</p>
                        <p><span className="font-medium">Дата выдачи:</span> {formatDate(license.issuedDate)}</p>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between pt-4">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewLicense(license)}>
                        <Eye size={14} />
                        Просмотр
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => handleEditLicense(license)}>
                          <Pencil size={14} />
                          Изменить
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeleteLicense(license)}>
                          <Trash2 size={14} />
                          Удалить
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="avail">
          <div className="text-center py-8">Функциональность фильтрации находится в разработке</div>
        </TabsContent>

        <TabsContent value="used">
          <div className="text-center py-8">Функциональность фильтрации находится в разработке</div>
        </TabsContent>

        <TabsContent value="blocked">
          <div className="text-center py-8">Функциональность фильтрации находится в разработке</div>
        </TabsContent>
      </Tabs>

      {/* Add License Dialog */}
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
            onClose={() => setOpenAddLicense(false)}
            onSuccess={() => {
              setOpenAddLicense(false);
              queryClient.invalidateQueries({ queryKey: ["/api/v1/licenses"] });
              toast({
                title: "Успех",
                description: "Лицензия успешно создана",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit License Dialog */}
      <Dialog open={openEditLicense} onOpenChange={setOpenEditLicense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить данные лицензии</DialogTitle>
            <DialogDescription>
              Обновите данные лицензии
            </DialogDescription>
          </DialogHeader>
          {selectedLicense && (
            <LicenseForm 
            clients={clients}
            license={{...selectedLicense, client_id: selectedLicense.client_id}}
              onClose={() => setOpenEditLicense(false)}
              onSuccess={() => {
                setOpenEditLicense(false);
                queryClient.invalidateQueries({ queryKey: ["/api/v1/licenses"] });
                toast({
                  title: "Успех",
                  description: "Лицензия успешно обновлена",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete License Dialog */}
        <DeleteLicenseDialog
          open={openDeleteLicense}
          onOpenChange={setOpenDeleteLicense}
          license={selectedLicense}
          onClose={() => {
            setOpenDeleteLicense(false);
            setSelectedLicense(null);
          }}
        />
        </div>
      </main>
    </div>
  );
}