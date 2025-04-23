import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UpdateResponse } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Updates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openEditUpdate, setOpenEditUpdate] = useState(false);
  const [openDeleteUpdate, setOpenDeleteUpdate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateResponse | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    release_notes: ""
  });
  const [openViewUpdate, setOpenViewUpdate] = useState(false); // Added state for view dialog
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1); // Added state for pagination


  // Функция для получения обновлений по статусу
  const { 
    data: updates, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["updates"],
    queryFn: API.updates.getAll
  });

  const filteredUpdates = updates?.filter(update => {
    if (selectedStatus === "all") return true;
    return update.status === selectedStatus.toUpperCase();
  });

  // Мутация для обновления
  const updateMutation = useMutation({
    mutationFn: (data: { status: string; release_notes: string }) => {
      if (!selectedUpdate) return Promise.reject("No update selected");
      return API.updates.update(selectedUpdate.update_id, {
        status: data.status,
        release_notes: data.release_notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["updates"]);
      setOpenEditUpdate(false);
      toast({
        title: "Успех",
        description: "Обновление успешно изменено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить обновление",
        variant: "destructive",
      });
    }
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedUpdate) return Promise.reject("No update selected");
      return API.updates.delete(selectedUpdate.update_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["updates"]);
      setOpenDeleteUpdate(false);
      toast({
        title: "Успех",
        description: "Обновление успешно удалено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить обновление",
        variant: "destructive",
      });
    }
  });

  const handleEditUpdate = (update: UpdateResponse) => {
    setSelectedUpdate(update);
    setEditForm({
      status: update.status,
      release_notes: update.release_notes || ""
    });
    setOpenEditUpdate(true);
  };

  const handleDeleteUpdate = (update: UpdateResponse) => {
    setSelectedUpdate(update);
    setOpenDeleteUpdate(true);
  };

  const handleViewUpdate = (update: UpdateResponse) => {
    setSelectedUpdate(update);
    setOpenViewUpdate(true);
  }; // Added handler for view dialog

  const handleSubmitEdit = () => {
    if (!selectedUpdate) return;
    updateMutation.mutate({
      status: editForm.status,
      release_notes: editForm.release_notes
    });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  // Форматирование данных
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  const formatSize = (size: number) => {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Рендер карточек обновлений
  const renderUpdateCards = (updates: UpdateResponse[] | undefined) => {
    if (!updates || updates.length === 0) {
      return <div className="text-center py-8">Нет данных об обновлениях</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {updates.slice((page - 1) * 10, page * 10).map((update) => (
          <Card key={update.update_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">v{update.lm_version}</CardTitle>
                  <p className="text-sm text-muted-foreground">ID: {update.update_id}</p>
                </div>
                <Badge variant={
                  update.status === 'ACTIVE' ? 'default' : 
                  update.status === 'OBSOLETE' ? 'destructive' : 
                  'secondary'
                }>
                  {update.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Дата релиза:</span> {formatDate(update.release_date)}</p>
                <p><span className="font-medium">Размер:</span> {formatSize(update.size)}</p>
                <p><span className="font-medium">Статус:</span> {update.status}</p>
                <div>
                  <p className="font-medium">Примечания к релизу:</p>
                  <div className="whitespace-pre-line bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 text-xs">
                    {update.release_notes || "Нет примечаний"}
                  </div>
                </div>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-end pt-4">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-green-600" 
                  onClick={() => handleViewUpdate(update)}
                >
                  <Eye size={14} />
                  Просмотр
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-blue-600" 
                  onClick={() => handleEditUpdate(update)}
                >
                  <Pencil size={14} />
                  Изменить
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-red-600" 
                  onClick={() => handleDeleteUpdate(update)}
                >
                  <Trash2 size={14} />
                  Удалить
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Обновления</h1>
          </div>

          <Tabs defaultValue="all" onValueChange={(value) => {
            setSelectedStatus(value === "all" ? "" : value.toUpperCase());
            setPage(1); // Reset page when changing tabs
          }}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="active">ACTIVE</TabsTrigger>
              <TabsTrigger value="draft">DRAFT</TabsTrigger>
              <TabsTrigger value="obsolete">OBSOLETE</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка обновлений...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
              ) : (
                renderUpdateCards(filteredUpdates)
              )}
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
                    Страница {page} из {Math.ceil(filteredUpdates?.length / 10) || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(Math.ceil(filteredUpdates?.length / 10) || 0, p + 1))}
                    disabled={page >= Math.ceil(filteredUpdates?.length / 10) || 0}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка обновлений...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
              ) : (
                renderUpdateCards(updates?.filter(u => u.status === "ACTIVE"))
              )}
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
                    Страница {page} из {Math.ceil((updates?.filter(u => u.status === "ACTIVE")?.length || 0) / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(Math.ceil((updates?.filter(u => u.status === "ACTIVE")?.length || 0) / 10), p + 1))}
                    disabled={page >= Math.ceil((updates?.filter(u => u.status === "ACTIVE")?.length || 0) / 10)}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка обновлений...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
              ) : (
                renderUpdateCards(updates?.filter(u => u.status === "DRAFT"))
              )}
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
                    Страница {page} из {Math.ceil((updates?.filter(u => u.status === "DRAFT")?.length || 0) / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(Math.ceil((updates?.filter(u => u.status === "DRAFT")?.length || 0) / 10), p + 1))}
                    disabled={page >= Math.ceil((updates?.filter(u => u.status === "DRAFT")?.length || 0) / 10)}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="obsolete" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Загрузка обновлений...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
              ) : (
                renderUpdateCards(updates?.filter(u => u.status === "OBSOLETE"))
              )}
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
                    Страница {page} из {Math.ceil((updates?.filter(u => u.status === "OBSOLETE")?.length || 0) / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(Math.ceil((updates?.filter(u => u.status === "OBSOLETE")?.length || 0) / 10), p + 1))}
                    disabled={page >= Math.ceil((updates?.filter(u => u.status === "OBSOLETE")?.length || 0) / 10)}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Диалог редактирования */}
          <Dialog open={openEditUpdate} onOpenChange={setOpenEditUpdate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактирование v{selectedUpdate?.lm_version}</DialogTitle>
                <DialogDescription>ID: {selectedUpdate?.update_id}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="status" className="text-right">
                    Статус
                  </label>
                  <Select 
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({...editForm, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">DRAFT</SelectItem>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="OBSOLETE">OBSOLETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="notes" className="text-right">
                    Примечания
                  </label>
                  <Textarea
                    id="notes"
                    value={editForm.release_notes}
                    onChange={(e) => setEditForm({...editForm, release_notes: e.target.value})}
                    className="col-span-3"
                    placeholder="Введите примечания к релизу"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditUpdate(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleSubmitEdit}
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Диалог удаления */}
          <Dialog open={openDeleteUpdate} onOpenChange={setOpenDeleteUpdate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удаление обновления</DialogTitle>
                <DialogDescription>
                  Вы уверены, что хотите удалить это обновление?
                </DialogDescription>
              </DialogHeader>
              {selectedUpdate && (
                <div className="py-4 space-y-2">
                  <p><span className="font-medium">Версия:</span> v{selectedUpdate.lm_version}</p>
                  <p><span className="font-medium">ID:</span> {selectedUpdate.update_id}</p>
                  <p><span className="font-medium">Статус:</span> {selectedUpdate.status}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteUpdate(false)}>
                  Отмена
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? "Удаление..." : "Удалить"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Update Dialog */}
          <Dialog open={openViewUpdate} onOpenChange={setOpenViewUpdate}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Просмотр обновления</DialogTitle>
              </DialogHeader>
              {selectedUpdate && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Основная информация</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Версия</p>
                        <p className="text-sm">v{selectedUpdate.lm_version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID обновления</p>
                        <p className="text-sm">{selectedUpdate.update_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Статус</p>
                        <p className="text-sm">{selectedUpdate.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Размер</p>
                        <p className="text-sm">{formatSize(selectedUpdate.size)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата релиза</p>
                        <p className="text-sm">{formatDate(selectedUpdate.release_date)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Примечания к релизу</h4>
                    <div className="whitespace-pre-line bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                      {selectedUpdate.release_notes || "Нет примечаний"}
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