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
  const [showViewModal, setShowViewModal] = useState(false); // Added state for view modal

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
    mutationFn: ({ id, data }: { id: number, data: Partial<LicenseResponse> }) => API.licenses.update(id, data),
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

  const handleViewLicense = (license: LicenseResponse) => {
    setSelectedLicense(license); // Set selectedLicense for the dialog
    setShowViewModal(true);       // Open the view modal
  };

  const handleConfirmDelete = () => {
    if (selectedLicense) {
      deleteLicenseMutation.mutate(selectedLicense.license_id);
    }
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
                <div className="text-center py-8">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Ошибка загрузки данных: {error.message}
                </div>
              ) : !licenses || licenses.length === 0 ? (
                <div className="text-center py-8">Нет данных о лицензиях</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {licenses.map((license: LicenseResponse) => {
                    const badgeInfo = getLicenseBadge(license.status);
                    const clientName = getClientName(license.client_id);

                    return (
                      <Card key={license.license_id} className="overflow-hidden">
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
                            <p><span className="font-medium">ID:</span> {license.license_id}</p>
                            <p><span className="font-medium">Клиент:</span> {clientName}</p>
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

            <TabsContent value="avail" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Ошибка загрузки данных: {error.message}
                </div>
              ) : !licenses || licenses.length === 0 ? (
                <div className="text-center py-8">Нет доступных лицензий</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {licenses.filter(license => license.status === "AVAIL").map((license) => {
                    const badgeInfo = getLicenseBadge(license.status);
                    const clientName = getClientName(license.client_id);
                    return (
                      // Render the same card as in "all" tab
                      <Card key={license.license_id} className="overflow-hidden">
                        {/* Same card content as above */}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl font-mono">{license.license_key}</CardTitle>
                            <Badge variant={badgeInfo.variant} className={badgeInfo.className}>
                              {badgeInfo.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">ID:</span> {license.license_id}</p>
                            <p><span className="font-medium">Клиент:</span> {clientName}</p>
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

            <TabsContent value="used" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Ошибка загрузки данных: {error.message}
                </div>
              ) : !licenses || licenses.length === 0 ? (
                <div className="text-center py-8">Нет используемых лицензий</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {licenses.filter(license => license.status === "USED").map((license) => {
                    const badgeInfo = getLicenseBadge(license.status);
                    const clientName = getClientName(license.client_id);
                    return (
                      <Card key={license.license_id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl font-mono">{license.license_key}</CardTitle>
                            <Badge variant={badgeInfo.variant} className={badgeInfo.className}>
                              {badgeInfo.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">ID:</span> {license.license_id}</p>
                            <p><span className="font-medium">Клиент:</span> {clientName}</p>
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

            <TabsContent value="blocked" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Ошибка загрузки данных: {error.message}
                </div>
              ) : !licenses || licenses.length === 0 ? (
                <div className="text-center py-8">Нет заблокированных лицензий</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {licenses.filter(license => license.status === "BLOCKED").map((license) => {
                    const badgeInfo = getLicenseBadge(license.status);
                    const clientName = getClientName(license.client_id);
                    return (
                      <Card key={license.license_id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl font-mono">{license.license_key}</CardTitle>
                            <Badge variant={badgeInfo.variant} className={badgeInfo.className}>
                              {badgeInfo.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">ID:</span> {license.license_id}</p>
                            <p><span className="font-medium">Клиент:</span> {clientName}</p>
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
                onSubmit={(data) => {
                  const licenseData = {
                    client_id: Number(data.client_id),
                    license_key: data.license_key,
                    status: data.status || "AVAIL"
                  };
                  createLicenseMutation.mutate(licenseData);
                }}
                onClose={() => setOpenAddLicense(false)}
                isLoading={createLicenseMutation.isPending}
                initialValues={{
                  client_id: 0,
                  license_key: "",
                  status: "AVAIL"
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
                  license={selectedLicense}
                  onSubmit={(data) => {
                    if (!selectedLicense) return;
                    const licenseData = {
                      client_id: Number(data.client_id),
                      license_key: data.license_key,
                      status: data.status || "AVAIL"
                    };
                    updateLicenseMutation.mutate({
                      license_id: selectedLicense.license_id,
                      data: licenseData
                    });
                  }}
                  onClose={() => setOpenEditLicense(false)}
                  isLoading={updateLicenseMutation.isPending}
                  initialValues={{
                    client_id: selectedLicense.client_id,
                    license_key: selectedLicense.license_key,
                    status: selectedLicense.status || "AVAIL"
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

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

          {/* View License Dialog */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Просмотр лицензии</DialogTitle>
              </DialogHeader>
              {selectedLicense && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Основная информация</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Ключ лицензии</p>
                        <p className="text-sm font-mono">{selectedLicense.license_key}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Клиент</p>
                        <p className="text-sm">{getClientName(selectedLicense.client_id)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Статус</p>
                        <p className="text-sm">{selectedLicense.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата выдачи</p>
                        <p className="text-sm">{formatDate(selectedLicense.issuedDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}