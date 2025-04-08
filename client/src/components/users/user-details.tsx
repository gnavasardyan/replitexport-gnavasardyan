import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserResponse } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface UserDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
}

export function UserDetails({ open, onOpenChange, user }: UserDetailsProps) {
  if (!user) return null;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Не указано";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: "ACTIVE" | "CREATED" | "CONFIRMED" | undefined) => {
    switch (status) {
      case "ACTIVE":
        return "Активный";
      case "CREATED":
        return "Создан";
      case "CONFIRMED":
        return "Подтвержден";
      default:
        return status || "Не указан";
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    return role === "admin" ? "Администратор" : "Пользователь";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Детали пользователя</DialogTitle>
          <DialogDescription>
            Подробная информация о пользователе {user.username}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <div>
              <h3 className="font-medium text-lg">Основная информация</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Имя пользователя</div>
                <div className="text-sm font-medium">{user.username}</div>

                <div className="text-sm text-muted-foreground">Полное имя</div>
                <div className="text-sm font-medium">{user.name || "-"}</div>

                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm font-medium">{user.email || "-"}</div>

                <div className="text-sm text-muted-foreground">Роль</div>
                <div className="text-sm font-medium">{getRoleLabel(user.role)}</div>

                <div className="text-sm text-muted-foreground">Статус</div>
                <div className="text-sm font-medium">{getStatusLabel(user.status)}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg">Системная информация</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">ID пользователя</div>
                <div className="text-sm font-medium">{user.user_id}</div>

                <div className="text-sm text-muted-foreground">Дата создания</div>
                <div className="text-sm font-medium">{formatDate(user.createdAt)}</div>

                <div className="text-sm text-muted-foreground">Последний вход</div>
                <div className="text-sm font-medium">{user.last_logon_time ? formatDate(user.last_logon_time) : "-"}</div>
              </div>
            </div>

            {(user.partner_id || user.client_id) && (
              <div>
                <h3 className="font-medium text-lg">Связи</h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2">
                  {user.partner_id && (
                    <>
                      <div className="text-sm text-muted-foreground">ID партнера</div>
                      <div className="text-sm font-medium">{user.partner_id}</div>
                    </>
                  )}

                  {user.client_id && (
                    <>
                      <div className="text-sm text-muted-foreground">ID клиента</div>
                      <div className="text-sm font-medium">{user.client_id}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}