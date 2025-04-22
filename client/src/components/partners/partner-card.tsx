import { Partner } from "@/types/partner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PartnerCardProps {
  partner: Partner;
  onView: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

export function PartnerCard({
  partner,
  onView,
  onEdit,
  onDelete,
}: PartnerCardProps) {
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{partner.partner_name}</h3>
          {partner.status && (
            <Badge variant="outline">{partner.status}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="mr-2 w-4 h-4 text-gray-400" />
          <span>{partner.email}</span>
        </div>
        <div className="text-sm text-gray-600">
          <div>ИНН: {partner.inn}</div>
          <div>КПП: {partner.kpp}</div>
          <div>ОГРН: {partner.ogrn}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-blue-600" 
            onClick={() => onEdit(partner)}
          >
            <Pencil size={14} />
            Изменить
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-red-600" 
            onClick={() => onDelete(partner)}
          >
            <Trash2 size={14} />
            Удалить
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-green-600"
            onClick={() => onView(partner)}
          >
            <Eye size={14} />
            Просмотр
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}