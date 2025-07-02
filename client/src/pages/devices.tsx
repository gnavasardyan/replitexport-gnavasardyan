import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Eye, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceResponse, ClientResponse, UpdateResponse } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Devices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDeleteDevice, setOpenDeleteDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(null);
  const [openViewDevice, setOpenViewDevice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showOutdatedOnly, setShowOutdatedOnly] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const { data: devices, isLoading: isLoadingDevices, error: devicesError } = useQuery({
    queryKey: ["/api/v1/devices"],
    queryFn: API.devices.getAll,
  });

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ["/api/v1/clients"],
    queryFn: API.clients.getAll,
  });

  const { data: updates, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ["/api/v1/updates"],
    queryFn: API.updates.getAll,
  });

  const getClientName = (clientId: number) => {
    if (!clients) return clientId.toString();
    const client = clients.find((c: ClientResponse) => c.client_id === clientId);
    return client ? client.client_name : clientId.toString();
  };

  const getLatestActiveUpdate = (): UpdateResponse | null => {
    if (!updates) return null;
    const activeUpdates = updates.filter((update: UpdateResponse) => update.status === 'ACTIVE');
    if (activeUpdates.length === 0) return null;
    
    // Sort by version (assuming semantic versioning or lexicographic comparison)
    return activeUpdates.sort((a, b) => b.lm_version.localeCompare(a.lm_version))[0];
  };

  const isDeviceOutdated = (device: DeviceResponse): boolean => {
    const latestUpdate = getLatestActiveUpdate();
    if (!latestUpdate) return false;
    
    // Compare versions - device is outdated if its version is different from latest
    const isOutdated = device.lm_version !== latestUpdate.lm_version;
    console.log(`Device ${device.device_id}: current version ${device.lm_version}, latest ${latestUpdate.lm_version}, outdated: ${isOutdated}`);
    return isOutdated;
  };

  const handleDeviceSelection = (deviceId: number, checked: boolean) => {
    const newSelected = new Set(selectedDevices);
    if (checked) {
      newSelected.add(deviceId);
      console.log(`Device ${deviceId} selected`);
    } else {
      newSelected.delete(deviceId);
      console.log(`Device ${deviceId} deselected`);
    }
    console.log('Selected devices:', Array.from(newSelected));
    setSelectedDevices(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const outdatedDeviceIds = filteredDevices
        ?.filter(device => isDeviceOutdated(device))
        .map(device => device.device_id) || [];
      console.log('Selecting all outdated devices:', outdatedDeviceIds);
      setSelectedDevices(new Set(outdatedDeviceIds));
    } else {
      console.log('Clearing all selections');
      setSelectedDevices(new Set());
    }
  };

  const handleDeviceUpdate = async (deviceId: number) => {
    const latestUpdate = getLatestActiveUpdate();
    if (!latestUpdate) {
      toast({
        title: "Ошибка",
        description: "Нет доступных обновлений",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Updating device ${deviceId} to target version ${latestUpdate.lm_version}`);
      await API.devices.update(deviceId, { target_version: latestUpdate.lm_version });
      
      toast({
        title: "Успех",
        description: `Устройство ${deviceId} успешно обновлено`,
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/v1/devices"] });
    } catch (error) {
      console.error(`Device update error for ${deviceId}:`, error);
      toast({
        title: "Ошибка",
        description: `Не удалось обновить устройство ${deviceId}`,
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdate = async () => {
    const latestUpdate = getLatestActiveUpdate();
    if (!latestUpdate || selectedDevices.size === 0) {
      toast({
        title: "Ошибка",
        description: "Нет доступных обновлений или не выбраны устройства",
        variant: "destructive",
      });
      return;
    }

    try {
      // Apply update to all selected devices using direct device API
      const updatePromises = Array.from(selectedDevices).map(async (deviceId) => {
        console.log(`Updating device ${deviceId} to target version ${latestUpdate.lm_version}`);
        return API.devices.update(deviceId, { target_version: latestUpdate.lm_version });
      });

      const results = await Promise.all(updatePromises);
      console.log('Bulk update results:', results);
      
      toast({
        title: "Успех",
        description: `Обновление применено к ${selectedDevices.size} устройствам`,
        variant: "default",
      });
      
      // Refresh devices data and clear selection
      queryClient.invalidateQueries({ queryKey: ["/api/v1/devices"] });
      setSelectedDevices(new Set());
    } catch (error) {
      console.error('Bulk update error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось применить обновления ко всем устройствам",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDevice = (device: DeviceResponse) => {
    setSelectedDevice(device);
    setOpenDeleteDevice(true);
  };

  const handleViewDevice = (device: DeviceResponse) => {
    setSelectedDevice(device);
    setOpenViewDevice(true);
  };

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
  const handleConfirmDelete = async () => {
  if (!selectedDevice) return;

  try {
    await API.devices.delete(selectedDevice.device_id);
    toast({
      title: "Успех",
      description: "Устройство успешно удалено",
      variant: "default",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/v1/devices"] });
    setOpenDeleteDevice(false);
  } catch (error) {
    toast({
      title: "Ошибка",
      description: "Не удалось удалить устройство",
      variant: "destructive",
    });
  }
};
  const filteredDevices = devices?.filter(device => {
    const matchesClient = !searchQuery || device.client_id.toString() === searchQuery;
    const matchesStatus = !statusFilter || device.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesOutdated = !showOutdatedOnly || isDeviceOutdated(device);
    return matchesClient && matchesStatus && matchesOutdated;
  });

  const isLoading = isLoadingDevices || isLoadingClients || isLoadingUpdates;
  const error = devicesError || clientsError;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Устройства</h1>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Select onValueChange={(value) => setSearchQuery(value)}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Выберите клиента..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: ClientResponse) => (
                    <SelectItem key={client.client_id} value={client.client_id.toString()}>
                      {client.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Фильтр по статусу..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready">Готово</SelectItem>
                  <SelectItem value="not_configured">Не настроено</SelectItem>
                  <SelectItem value="initialization">Инициализация</SelectItem>
                  <SelectItem value="sync_error">Ошибка синхронизации</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="outdated-filter"
                  checked={showOutdatedOnly}
                  onCheckedChange={(checked) => setShowOutdatedOnly(checked as boolean)}
                />
                <label
                  htmlFor="outdated-filter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Только требующие обновления
                </label>
              </div>
            </div>

            {filteredDevices && filteredDevices.some(device => isDeviceOutdated(device)) && (
              <div className="flex gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={filteredDevices.filter(device => isDeviceOutdated(device)).every(device => selectedDevices.has(device.device_id))}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm">
                    Выбрать все устаревшие устройства
                  </label>
                </div>
                
                <Button
                  onClick={handleBulkUpdate}
                  disabled={selectedDevices.size === 0}
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Обновить выбранные ({selectedDevices.size})
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
              ) : !filteredDevices || filteredDevices.length === 0 ? (
                <div className="text-center py-8">Нет данных об устройствах</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDevices.slice((page - 1) * 10, page * 10).map((device: DeviceResponse) => {
                    const badgeInfo = getDeviceBadge(device.status);
                    const clientName = getClientName(device.client_id);
                    const isOutdated = isDeviceOutdated(device);

                    return (
                      <Card key={device.device_id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {isOutdated && (
                                <Checkbox
                                  checked={selectedDevices.has(device.device_id)}
                                  onCheckedChange={(checked) => handleDeviceSelection(device.device_id, checked as boolean)}
                                />
                              )}
                              <CardTitle className="text-xl">
                                Устройство {device.device_id}
                              </CardTitle>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant={badgeInfo.variant}
                                className={badgeInfo.className}
                              >
                                {badgeInfo.label}
                              </Badge>
                              {isOutdated && (
                                <Badge variant="destructive" className="text-xs">
                                  Требует обновления
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">ID устройства:</span> {device.device_id}</p>
                            <p><span className="font-medium">Клиент:</span> {clientName}</p>
                            <p><span className="font-medium">ID лицензии:</span> {device.license_id}</p>
                            <p><span className="font-medium">Дата создания:</span> {device.created_timestamp}</p>
                            <p><span className="font-medium">Версия:</span> {device.lm_version}</p>
                          </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex justify-between pt-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewDevice(device)}>
                              <Eye size={14} />
                              Просмотр
                            </Button>
                            {isOutdated && (
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-1 bg-blue-500 hover:bg-blue-600" 
                                onClick={() => handleDeviceUpdate(device.device_id)}
                              >
                                <RefreshCw size={14} />
                                Обновить
                              </Button>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeleteDevice(device)}>
                            <Trash2 size={14} />
                            Удалить
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Предыдущая
                      </Button>
                      <span className="mx-2">
                        Страница {page} из {Math.ceil(filteredDevices.length / 10)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(Math.ceil(filteredDevices.length / 10), p + 1))}
                        disabled={page >= Math.ceil(filteredDevices.length / 10)}
                      >
                        Следующая
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

          {/* Delete Device Dialog */}
          <Dialog open={openDeleteDevice} onOpenChange={setOpenDeleteDevice}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить устройство</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Вы уверены, что хотите удалить это устройство?</p>
                {selectedDevice && <p className="font-bold">
                  Устройство {selectedDevice.device_id} (Клиент: {getClientName(selectedDevice.client_id)})
                </p>}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpenDeleteDevice(false)}>
                  Отмена
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Удалить
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Device Dialog */}
          <Dialog open={openViewDevice} onOpenChange={setOpenViewDevice}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Просмотр устройства</DialogTitle>
              </DialogHeader>
              {selectedDevice && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Основная информация</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ID устройства</p>
                        <p className="text-sm">{selectedDevice.device_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Клиент</p>
                        <p className="text-sm">{getClientName(selectedDevice.client_id)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID лицензии</p>
                        <p className="text-sm">{selectedDevice.license_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Instance ID</p>
                        <p className="text-sm">{selectedDevice.inst_id}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Техническая информация</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">MAC-адрес</p>
                        <p className="text-sm">{selectedDevice.local_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Версия</p>
                        <p className="text-sm">{selectedDevice.lm_version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Статус</p>
                        <p className="text-sm">{selectedDevice.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата создания</p>
                        <p className="text-sm">{selectedDevice.created_timestamp}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата обновления</p>
                        <p className="text-sm">{selectedDevice.updated_timestamp}</p>
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