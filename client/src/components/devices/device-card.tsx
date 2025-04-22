import { Device } from "@/types/device";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Monitor, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DeviceCardProps {
  device: Device;
  onView: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

export function DeviceCard({
  device,
  onView,
  onEdit,
  onDelete,
}: DeviceCardProps) {
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
          <Badge variant="outline">{device.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <Monitor className="mr-2 w-4 h-4 text-gray-400" />
          <span>ID: {device.device_id}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-green-600" 
            onClick={() => onView(device)}
          >
            <Eye size={14} />
            Просмотр
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-blue-600" 
            onClick={() => onEdit(device)}
          >
            <Pencil size={14} />
            Изменить
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-red-600" 
            onClick={() => onDelete(device)}
          >
            <Trash2 size={14} />
            Удалить
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}