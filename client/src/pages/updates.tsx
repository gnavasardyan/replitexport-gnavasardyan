import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Eye, Download } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpdateResponse } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";

export default function Updates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddUpdate, setOpenAddUpdate] = useState(false);
  const [openEditUpdate, setOpenEditUpdate] = useState(false);
  const [openDeleteUpdate, setOpenDeleteUpdate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateResponse | null>(null);

  // Fetch updates
  const { data: updates, isLoading, error } = useQuery({
    queryKey: ["/api/v1/updates"],
    queryFn: API.updates.getAll,
  });

  const handleAddUpdate = () => {
    setOpenAddUpdate(true);
  };

  const handleEditUpdate = (update: UpdateResponse) => {
    setSelectedUpdate(update);
    setOpenEditUpdate(true);
  };

  const handleDeleteUpdate = (update: UpdateResponse) => {
    setSelectedUpdate(update);
    setOpenDeleteUpdate(true);
  };

  const handleViewUpdate = (update: UpdateResponse) => {
    toast({
      title: "Информация об обновлении",
      description: `${update.title} (v${update.version})`,
    });
  };

  const handleDownload = (update: UpdateResponse) => {
    if (update.downloadUrl) {
      window.open(update.downloadUrl, "_blank");
    } else {
      toast({
        title: "Ошибка",
        description: "URL загрузки не указан для этого обновления",
        variant: "destructive",
      });
    }
  };

  // Format date string to readable format
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Обновления</h1>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все обновления</TabsTrigger>
          <TabsTrigger value="required">Обязательные</TabsTrigger>
          <TabsTrigger value="optional">Опциональные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка обновлений...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : !updates || updates.length === 0 ? (
            <div className="text-center py-8">Нет данных об обновлениях</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {updates.map((update: UpdateResponse) => (
                <Card key={update.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{update.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Версия {update.version}</p>
                      </div>
                      {update.isRequired && (
                        <Badge className="bg-amber-500">
                          Обязательное
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Дата релиза:</span> {formatDate(update.releaseDate)}</p>
                      {update.description && (
                        <p><span className="font-medium">Описание:</span> {update.description}</p>
                      )}
                      {update.size && (
                        <p><span className="font-medium">Размер:</span> {update.size}</p>
                      )}
                      {update.releaseNotes && (
                        <div>
                          <p className="font-medium">Примечания к релизу:</p>
                          <div className="whitespace-pre-line bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 text-xs">
                            {update.releaseNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewUpdate(update)}>
                        <Eye size={14} />
                        Просмотр
                      </Button>
                      {update.downloadUrl && (
                        <Button variant="outline" size="sm" className="gap-1 text-green-600" onClick={() => handleDownload(update)}>
                          <Download size={14} />
                          Скачать
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => handleEditUpdate(update)}>
                        <Pencil size={14} />
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeleteUpdate(update)}>
                        <Trash2 size={14} />
                        Удалить
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="required">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>

        <TabsContent value="optional">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>
      </Tabs>

      {/* Add Update Dialog - Placeholder for now */}
      <Dialog open={openAddUpdate} onOpenChange={setOpenAddUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новое обновление</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для добавления нового обновления - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Update Dialog - Placeholder for now */}
      <Dialog open={openEditUpdate} onOpenChange={setOpenEditUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить данные обновления</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для редактирования обновления - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Update Dialog - Placeholder for now */}
      <Dialog open={openDeleteUpdate} onOpenChange={setOpenDeleteUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить обновление</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить это обновление?</p>
            {selectedUpdate && (
              <p className="font-bold">{selectedUpdate.title} (v{selectedUpdate.version})</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDeleteUpdate(false)}>
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