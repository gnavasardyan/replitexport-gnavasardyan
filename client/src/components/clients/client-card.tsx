import { Client } from "@/types/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({
  client,
  onView,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{client.client_name}</h3>
          <Badge variant="outline">{client.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="mr-2 w-4 h-4 text-gray-400" />
          <span>{client.inn}</span>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end pt-4">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-blue-600" 
            onClick={() => onEdit(client)}
          >
            <Pencil size={14} />
            Изменить
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-red-600" 
            onClick={() => onDelete(client)}
          >
            <Trash2 size={14} />
            Удалить
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}