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
import { ClientResponse } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddClient, setOpenAddClient] = useState(false);
  const [openEditClient, setOpenEditClient] = useState(false);
  const [openDeleteClient, setOpenDeleteClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null);

  // Fetch clients
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ["/api/v1/clients"],
    queryFn: API.clients.getAll,
  });

  const handleAddClient = () => {
    setOpenAddClient(true);
  };

  const handleEditClient = (client: ClientResponse) => {
    setSelectedClient(client);
    setOpenEditClient(true);
  };

  const handleDeleteClient = (client: ClientResponse) => {
    setSelectedClient(client);
    setOpenDeleteClient(true);
  };

  const handleViewClient = (client: ClientResponse) => {
    toast({
      title: "Информация о клиенте",
      description: `${client.name} (${client.email})`,
    });
  };

  // Format date string to readable format
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Button onClick={handleAddClient} className="gap-2">
          <Plus size={16} />
          Добавить клиента
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все клиенты</TabsTrigger>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="inactive">Неактивные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка клиентов...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : !clients || clients.length === 0 ? (
            <div className="text-center py-8">Нет данных о клиентах</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client: ClientResponse) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      {client.status && (
                        <Badge 
                          variant={client.status === "active" ? "default" : "outline"}
                          className={client.status === "active" ? "bg-green-500" : ""}
                        >
                          {client.status === "active" ? "Активный" : client.status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {client.email}</p>
                      {client.phone && (
                        <p><span className="font-medium">Телефон:</span> {client.phone}</p>
                      )}
                      {client.address && (
                        <p><span className="font-medium">Адрес:</span> {client.address}</p>
                      )}
                      {client.contactPerson && (
                        <p><span className="font-medium">Контактное лицо:</span> {client.contactPerson}</p>
                      )}
                      {client.industry && (
                        <p><span className="font-medium">Отрасль:</span> {client.industry}</p>
                      )}
                      {client.createdAt && (
                        <p><span className="font-medium">Создан:</span> {formatDate(client.createdAt)}</p>
                      )}
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between pt-4">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewClient(client)}>
                      <Eye size={14} />
                      Просмотр
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => handleEditClient(client)}>
                        <Pencil size={14} />
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeleteClient(client)}>
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

        <TabsContent value="active">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>
      </Tabs>

      {/* Add Client Dialog - Placeholder for now */}
      <Dialog open={openAddClient} onOpenChange={setOpenAddClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить нового клиента</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для добавления нового клиента - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog - Placeholder for now */}
      <Dialog open={openEditClient} onOpenChange={setOpenEditClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить данные клиента</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для редактирования клиента - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog - Placeholder for now */}
      <Dialog open={openDeleteClient} onOpenChange={setOpenDeleteClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить этого клиента?</p>
            {selectedClient && <p className="font-bold">{selectedClient.name}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDeleteClient(false)}>
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