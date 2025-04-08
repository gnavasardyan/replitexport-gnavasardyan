import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil, Plus, Trash2, Eye, X } from "lucide-react";
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
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { ClientResponse } from "@shared/schema";
import { ClientForm } from "@/components/clients/client-form";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddClient, setOpenAddClient] = useState(false);
  const [openEditClient, setOpenEditClient] = useState(false);
  const [openDeleteClient, setOpenDeleteClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      description: `${client.client_name} (ИНН: ${client.inn})`,
    });
  };
  
  // Удаление клиента
  const deleteMutation = useMutation({
    mutationFn: (id: number) => API.clients.delete(id),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Клиент успешно удален",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/clients"] });
      setOpenDeleteClient(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Не удалось удалить клиента: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelete = () => {
    if (selectedClient) {
      deleteMutation.mutate(selectedClient.client_id);
    }
  };

  // Format date string to readable format
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Фильтрация клиентов по поисковому запросу
  const filteredClients = clients?.filter(client => 
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Button onClick={handleAddClient} className="gap-2">
          <Plus size={16} />
          Добавить клиента
        </Button>
      </div>

      {/* Поиск и фильтрация клиентов */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск клиентов по названию..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSearchQuery("")}
          >
            {searchQuery && <X size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Загрузка клиентов...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
        ) : !filteredClients || filteredClients.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? "Нет результатов по вашему запросу" : "Нет данных о клиентах"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client: ClientResponse) => (
              <Card key={client.client_id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{client.client_name}</CardTitle>
                    <Badge variant="outline" className="bg-green-500 text-white">
                      {client.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">ИНН:</span> {client.inn}</p>
                    <p><span className="font-medium">ID партнера:</span> {client.partner_id}</p>
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
      </div>

      {/* Add Client Dialog */}
      <Dialog open={openAddClient} onOpenChange={setOpenAddClient}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить нового клиента</DialogTitle>
            <DialogDescription>
              Заполните форму для создания нового клиента
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            onClose={() => setOpenAddClient(false)}
            onSuccess={() => {
              setOpenAddClient(false);
              queryClient.invalidateQueries({ queryKey: ['/api/v1/clients'] });
              toast({
                title: "Успех",
                description: "Клиент успешно добавлен",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={openEditClient} onOpenChange={setOpenEditClient}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Изменить данные клиента</DialogTitle>
            <DialogDescription>
              Отредактируйте информацию о клиенте
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <ClientForm 
              client={selectedClient}
              onClose={() => setOpenEditClient(false)}
              onSuccess={() => {
                setOpenEditClient(false);
                queryClient.invalidateQueries({ queryKey: ['/api/v1/clients'] });
                toast({
                  title: "Успех",
                  description: "Данные клиента успешно обновлены",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={openDeleteClient} onOpenChange={setOpenDeleteClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента</DialogTitle>
            <DialogDescription>
              Внимание! Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить этого клиента?</p>
            {selectedClient && <p className="font-bold">{selectedClient.client_name}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDeleteClient(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}