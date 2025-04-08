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
import { UserResponse } from "@shared/schema";

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/v1/users"],
    queryFn: API.users.getAll,
  });

  const handleAddUser = () => {
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
    toast({
      title: "Информация о пользователе",
      description: `${user.name} (${user.username})`,
    });
  };

  // Format role name for display
  const formatRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "manager":
        return "Менеджер";
      case "user":
        return "Пользователь";
      default:
        return role;
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

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все пользователи</TabsTrigger>
          <TabsTrigger value="admin">Администраторы</TabsTrigger>
          <TabsTrigger value="other">Другие</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Загрузка пользователей...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8">Нет данных о пользователях</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user: UserResponse) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{user.name}</CardTitle>
                      <Badge 
                        variant={user.role === "admin" ? "default" : "outline"}
                        className={user.role === "admin" ? "bg-purple-500" : ""}
                      >
                        {formatRole(user.role)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Имя пользователя:</span> {user.username}</p>
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between pt-4">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewUser(user)}>
                      <Eye size={14} />
                      Просмотр
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => handleEditUser(user)}>
                        <Pencil size={14} />
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeleteUser(user)}>
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

        <TabsContent value="admin">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>

        <TabsContent value="other">
          <div className="text-center py-8">Функциональность находится в разработке</div>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog - Placeholder for now */}
      <Dialog open={openAddUser} onOpenChange={setOpenAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить нового пользователя</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для добавления нового пользователя - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog - Placeholder for now */}
      <Dialog open={openEditUser} onOpenChange={setOpenEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить данные пользователя</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Форма для редактирования пользователя - находится в разработке</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog - Placeholder for now */}
      <Dialog open={openDeleteUser} onOpenChange={setOpenDeleteUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить пользователя</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить этого пользователя?</p>
            {selectedUser && <p className="font-bold">{selectedUser.name} ({selectedUser.username})</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpenDeleteUser(false)}>
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