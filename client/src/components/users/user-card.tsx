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
import { Edit, Trash2, Eye, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Assumed to exist

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
      <Separator />
      <Separator />
      <CardFooter className="flex justify-end pt-4">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-blue-600" 
            onClick={() => onEdit(user)}
          >
            <Pencil size={14} />
            Изменить
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-red-600" 
            onClick={() => onDelete(user)}
          >
            <Trash2 size={14} />
            Удалить
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}