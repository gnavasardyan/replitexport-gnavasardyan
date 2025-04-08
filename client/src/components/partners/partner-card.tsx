import { Partner } from "@/types/partner";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Mail, Phone, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PartnerCardProps {
  partner: Partner;
  onView: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return "bg-green-100 text-green-800";
    case 'pending':
      return "bg-yellow-100 text-yellow-800";
    case 'suspended':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'supplier':
      return "bg-primary-100 text-primary-700";
    case 'distributor':
      return "bg-blue-100 text-blue-700";
    case 'retailer':
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function PartnerCard({ partner, onView, onEdit, onDelete }: PartnerCardProps) {
  const initials = getInitials(partner.partner_name || "");
  const statusColor = getStatusColor(partner.status || "");
  const typeColor = getTypeColor(partner.type || "");

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", typeColor)}>
            <span className="font-bold">{initials}</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{partner.partner_name}</h3>
            <p className="text-sm text-gray-500">{partner.inn}</p>
          </div>
        </div>
        {partner.status && (
          <Badge className={cn("text-xs", statusColor)} variant="outline">
            {partner.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Mail className="mr-2 w-4 h-4 text-gray-400" />
            <span>{partner.email}</span>
          </div>
          {partner.kpp && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="mr-2 w-4 h-4 text-gray-400 font-medium">КПП:</span>
              <span>{partner.kpp}</span>
            </div>
          )}
          {partner.ogrn && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="mr-2 w-4 h-4 text-gray-400 font-medium">ОГРН:</span>
              <span>{partner.ogrn}</span>
            </div>
          )}
          {partner.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 w-4 h-4 text-gray-400" />
              <span>{partner.address}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500">ИНН</span>
            <p className="text-sm font-medium">{partner.inn}</p>
          </div>
          {partner.apitoken && (
            <div>
              <span className="text-xs font-medium text-gray-500">API TOKEN</span>
              <p className="text-sm font-medium">{partner.apitoken.substring(0, 8)}...</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
        <button
          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          onClick={() => onView(partner)}
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          onClick={() => onEdit(partner)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="text-gray-600 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
          onClick={() => onDelete(partner)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardFooter>
    </Card>
  );
}
