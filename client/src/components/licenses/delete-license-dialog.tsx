import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { LicenseResponse } from "@shared/schema";
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

interface DeleteLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: LicenseResponse | null;
    onClose: () => void;
}

export function DeleteLicenseDialog({
  open,
  onOpenChange,
    onClose,
    license,
}: DeleteLicenseDialogProps) {
    const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => API.licenses.delete(id),
    onSuccess: () => {
      toast({
        title: "License deleted",
        description: "The license has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/licenses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete license: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!license) return;
    deleteMutation.mutate(license.license_id);

  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete License</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>{license?.license_key}</strong>? All of their data will be
            permanently removed from our servers. This action cannot be undone.
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