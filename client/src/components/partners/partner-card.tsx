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
      <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(partner)}
          className="text-gray-600 hover:text-gray-900"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(partner)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(partner)}
            className="text-gray-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}