import { Partner } from "@/types/partner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
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
    case 'suspended':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800"
  }
};

const getInitials = (name: string) => {
  return name.split(" ")
             .map((part) => part.charAt(0))
             .join("")
             .toUpperCase()
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
  };
};
//
export function PartnerCard({
  partner,
  onView,
  onEdit,
  onDelete,
}: PartnerCardProps) {
  const initials = getInitials(partner.partner_name || "");
  const statusColor = getStatusColor(partner.status || "");
  const typeColor = getTypeColor(partner.type || "");
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-4">
          {partner.status && (
            <Badge className={cn("text-xs", statusColor)} variant="outline">
              {partner.status}
            </Badge>
          )}
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", typeColor,)}>
            <span className="font-bold">{initials}</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{partner.partner_name}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
          <div className="flex items-center text-sm text-gray-600"> 
              <Mail className="mr-2 w-4 h-4 text-gray-400" />
              <span>{partner.email}</span>
          </div>
          <Separator />
          

          <div className="flex flex-col mt-4 space-y-3">
            <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-gray-50/50 rounded-md">
              <span className="mr-3 text-gray-400 font-medium">ИНН:</span>
              <span className="font-medium">{partner.inn}</span>
            </div>
             {partner.kpp && (
              <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-gray-50/50 rounded-md">
                <span className="mr-3 text-gray-400 font-medium">КПП:</span>
                <span className="font-medium">{partner.kpp}</span>
              </div>
            )}
            {partner.ogrn && (
              <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-gray-50/50 rounded-md">
                <span className="mr-3 text-gray-400 font-medium">ОГРН:</span>
                <span className="font-medium">{partner.ogrn}</span>
              </div>
            )}
            {partner.address && (
               <div className="flex items-center text-sm text-gray-600">
               <MapPin className="mr-2 w-4 h-4 text-gray-400" />
               <span>{partner.address}</span>
             </div>
            )}
          </div>
          <div className="flex flex-col mt-4">
              {partner.apitoken && (
              <div className="flex text-sm text-gray-600">
                <span className="mr-2 w-4 h-4 text-gray-400 font-medium">API TOKEN:</span>
                <span>{partner.apitoken.substring(0, 8)}...</span>
              </div>
           )}
          </div>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between space-x-2">
            
        
        <button
          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          onClick={() => onView(partner)}
        >
          <Eye className="h-4 w-4"/>
        </button>
        <div className="flex gap-2">
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
        </div>
        </CardFooter>
    </Card>
  );
}
