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
        title: "Partner deleted",
        description: "The partner has been successfully deleted.",
      });
      onDelete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete partner: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (partner) {
      deleteMutation.mutate(partner.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Partner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{partner?.name}</strong>? All of their data will be permanently removed from our servers. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
