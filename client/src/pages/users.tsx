import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserResponse } from "@shared/schema";

// Импортируем наши компоненты
import { UserCard } from "@/components/users/user-card";
import { UserForm } from "@/components/users/user-form";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { UserDetails } from "@/components/users/user-details";

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);
  const [openViewUser, setOpenViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Получаем пользователей
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/v1/users"],
    queryFn: API.users.getAll,
  });

  // Фильтруем пользователей в зависимости от выбранной вкладки
  const filteredUsers = users.filter((user: UserResponse) => {
    if (activeTab === "all") return true;
    if (activeTab === "admin") return user.role === "admin";
    if (activeTab === "user") return user.role === "user";
    return true;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setOpenAddUser(true);
  };

  const handleEditUser = (user: UserResponse) => {
    setSelectedUser(user);
    setOpenEditUser(true);
  };

  const handleDeleteUser = (user: UserResponse) => {
    setSelectedUser(user);
    setOpenDeleteUser(true);
  };

  const handleViewUser = (user: UserResponse) => {
    setSelectedUser(user);
    setOpenViewUser(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await apiRequest("DELETE", `/api/v1/users/${selectedUser.user_id}`, undefined);

      // Обновляем кеш запросов
      queryClient.invalidateQueries({ queryKey: ["/api/v1/users"] });

      toast({
        title: "Пользователь удален",
        description: `Пользователь ${selectedUser.username} успешно удален.`,
      });

      setOpenDeleteUser(false);
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Пользователи</h1>
        <Button onClick={handleAddUser} className="gap-2">
          <Plus size={16} />
          Добавить пользователя
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все пользователи</TabsTrigger>
          <TabsTrigger value="admin">Администраторы</TabsTrigger>
          <TabsTrigger value="user">Пользователи</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка пользователей...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">Нет данных о пользователях</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user: UserResponse) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onView={handleViewUser}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка пользователей...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">Нет администраторов в системе</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user: UserResponse) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onView={handleViewUser}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка пользователей...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">Нет обычных пользователей в системе</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user: UserResponse) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onView={handleViewUser}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог добавления пользователя */}
      <Dialog open={openAddUser} onOpenChange={setOpenAddUser}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить нового пользователя</DialogTitle>
          </DialogHeader>
          <UserForm 
            onClose={() => setOpenAddUser(false)}
            onSuccess={() => {
              setOpenAddUser(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog open={openEditUser} onOpenChange={setOpenEditUser}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onClose={() => setOpenEditUser(false)}
              onSuccess={() => {
                setOpenEditUser(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра пользователя */}
      <UserDetails 
        open={openViewUser} 
        onOpenChange={setOpenViewUser} 
        user={selectedUser} 
      />

      {/* Диалог удаления пользователя */}
      <DeleteUserDialog
        open={openDeleteUser}
        onOpenChange={setOpenDeleteUser}
        user={selectedUser}
        onClose={() => setOpenDeleteUser(false)}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}