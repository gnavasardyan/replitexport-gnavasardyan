import { UserResponse } from "@shared/schema";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";

interface UserCardProps {
  user: UserResponse;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onView: (user: UserResponse) => void;
}

export function UserCard({ user, onEdit, onDelete, onView }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'CREATED':
        return 'bg-blue-500';
      case 'CONFIRMED':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Администратор' : 'Пользователь';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate" title={user.username}>
            {user.username}
          </CardTitle>
          <Badge variant="outline" className="ml-2">
            {getRoleLabel(user.role || 'user')}
          </Badge>
        </div>
        <CardDescription className="truncate" title={user.email || ''}>
          {user.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Имя:</span> {user.name || '-'}
          </div>
          {user.createdAt && (
            <div className="text-sm">
              <span className="font-semibold">Создан:</span> {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onView(user)}>
            <Eye className="h-4 w-4 mr-1" />
            Детали
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4 mr-1" />
            Изменить
          </Button>
        </div>
        <Button variant="destructive" size="sm" onClick={() => onDelete(user)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Удалить
        </Button>
      </CardFooter>
    </Card>
  );
}