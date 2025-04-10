import { useMutation } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Partner } from "@/types/partner";
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
import { useToast } from "@/hooks/use-toast";

interface DeletePartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onClose: () => void;
  onDelete: () => void;
}

export function DeletePartnerDialog({
  open,
  onOpenChange,
  partner,
  onClose,
  onDelete,
}: DeletePartnerDialogProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => API.partners.delete(id),
    onSuccess: () => {
      toast({
        title: "Партнер удален",
        description: "Партнер был успешно удален.",
      });
      onDelete();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось удалить партнера: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
      if (partner) {
      deleteMutation.mutate(partner.partner_id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Удалить партнера</AlertDialogTitle>
          <AlertDialogDescription>
              Вы уверены, что хотите удалить <strong>{partner?.name}</strong>? Все их данные будут безвозвратно удалены с наших серверов. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Отмена</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
