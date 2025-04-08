import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserResponse } from "@shared/schema";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onClose,
  onDelete,
}: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены, что хотите удалить пользователя?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы собираетесь удалить пользователя <strong>{user.username}</strong>. 
            Это действие нельзя отменить, и все данные, связанные с этим пользователем, будут удалены.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}