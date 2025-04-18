import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceResponse } from "@shared/schema";

import { Sidebar } from "@/components/layout/sidebar";

export default function Devices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openEditDevice, setOpenEditDevice] = useState(false);
  const [openDeleteDevice, setOpenDeleteDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(null);

  // Fetch devices
  const { data: devices, isLoading, error } = useQuery({
    queryKey: ["/api/v1/devices"],
    queryFn: API.devices.getAll,
  });

  const handleEditDevice = (device: DeviceResponse) => {
    setSelectedDevice(device);
    setOpenEditDevice(true);
  };

  const handleDeleteDevice = (device: DeviceResponse) => {
    setSelectedDevice(device);
    setOpenDeleteDevice(true);
  };

  const handleViewDevice = (device: DeviceResponse) => {
    toast({
      title: "Информация об устройстве",
      description: `ID: ${device.device_id}, Статус: ${device.status || "Не указан"}`,
    });
  };

  // Get status badge styling based on device status
  const getDeviceBadge = (status: string | undefined) => {
    if (!status) return { variant: "outline" as const, className: "", label: "Нет статуса" };
    
    switch (status.toLowerCase()) {
      case "ready":
        return { variant: "default" as const, className: "bg-green-500", label: "Готово" };
      case "not_configured":
        return { variant: "outline" as const, className: "text-gray-500", label: "Не настроено" };
      case "initialization":
        return { variant: "outline" as const, className: "text-amber-500", label: "Инициализация" };
      case "sync_error":
        return { variant: "outline" as const, className: "text-red-500", label: "Ошибка синхронизации" };
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
        <h1 className="text-3xl font-bold">Устройства</h1>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все устройства</TabsTrigger>
          <TabsTrigger value="ready">Готовые</TabsTrigger>
          <TabsTrigger value="not_configured">Не настроенные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка устройств...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : !devices || devices.length === 0 ? (
            <div className="text-center py-8">Нет данных об устройствах</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device: DeviceResponse) => {
                const badgeInfo = getDeviceBadge(device.status);
                
                return (
                  <Card key={device.device_id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                          Устройство {device.device_id}
                        </CardTitle>
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
                        <p><span className="font-medium">ID устройства:</span> {device.device_id}</p>
                        <p><span className="font-medium">ID клиента:</span> {device.client_id}</p>
                        <p><span className="font-medium">ID лицензии:</span> {device.license_id}</p>
                        <p><span className="font-medium">ID установки:</span> {device.inst_id}</p>
                        <p><span className="font-medium">Версия ОС:</span> {device.os_version}</p>
                        <p><span className="font-medium">MAC-адрес:</span> {device.local_id}</p>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between pt-4">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewDevice(device)}>
                        <Eye size={14} />
                        Просмотр
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => handleEditDevice(device)}>
                          <Pencil size={14} />
                          Изменить
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeleteDevice(device)}>
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

        <TabsContent value="ready">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>

        <TabsContent value="not_configured">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>
      </Tabs>

      {/* Edit Device Dialog - Placeholder for now */}
      <Dialog open={openEditDevice} onOpenChange={setOpenEditDevice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить данные устройства</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для редактирования устройства - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Device Dialog - Placeholder for now */}
      <Dialog open={openDeleteDevice} onOpenChange={setOpenDeleteDevice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить устройство</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить это устройство?</p>
            {selectedDevice && <p className="font-bold">
              Устройство {selectedDevice.device_id}
            </p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDeleteDevice(false)}>
              Отмена
            </Button>
            <Button variant="destructive">
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </main>
    </div>
  );
}