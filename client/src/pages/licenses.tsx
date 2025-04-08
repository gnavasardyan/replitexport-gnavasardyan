import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LicenseResponse } from "@shared/schema";

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
      description: `${license.licenseKey} (${license.status || "Статус не указан"})`,
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
    
    switch (status.toLowerCase()) {
      case "active":
        return { variant: "default" as const, className: "bg-green-500", label: "Активна" };
      case "expired":
        return { variant: "outline" as const, className: "text-red-500", label: "Истекла" };
      case "suspended":
        return { variant: "outline" as const, className: "text-amber-500", label: "Приостановлена" };
      default:
        return { variant: "outline" as const, className: "", label: status };
    }
  };

  return (
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
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="expired">Истекшие</TabsTrigger>
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
                        <CardTitle className="text-xl font-mono">{license.licenseKey}</CardTitle>
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
                        {license.clientId && (
                          <p><span className="font-medium">ID клиента:</span> {license.clientId}</p>
                        )}
                        <p><span className="font-medium">Дата выдачи:</span> {formatDate(license.issuedDate)}</p>
                        {license.expiryDate && (
                          <p><span className="font-medium">Дата окончания:</span> {formatDate(license.expiryDate)}</p>
                        )}
                        {license.features && (
                          <p><span className="font-medium">Функции:</span> {license.features}</p>
                        )}
                        {license.maxDevices && (
                          <p><span className="font-medium">Макс. устройств:</span> {license.maxDevices}</p>
                        )}
                        {license.notes && (
                          <p><span className="font-medium">Примечания:</span> {license.notes}</p>
                        )}
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

        <TabsContent value="active">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>

        <TabsContent value="expired">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>
      </Tabs>

      {/* Add License Dialog - Placeholder for now */}
      <Dialog open={openAddLicense} onOpenChange={setOpenAddLicense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новую лицензию</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для добавления новой лицензии - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit License Dialog - Placeholder for now */}
      <Dialog open={openEditLicense} onOpenChange={setOpenEditLicense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить данные лицензии</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для редактирования лицензии - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete License Dialog - Placeholder for now */}
      <Dialog open={openDeleteLicense} onOpenChange={setOpenDeleteLicense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить лицензию</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить эту лицензию?</p>
            {selectedLicense && <p className="font-bold font-mono">{selectedLicense.licenseKey}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDeleteLicense(false)}>
              Отмена
            </Button>
            <Button variant="destructive">
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}