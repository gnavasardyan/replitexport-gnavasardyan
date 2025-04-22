import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PartnerCard } from "./partner-card";
import { Partner, PartnerStatuses, PartnerTypes } from "@/types/partner";
import { PartnerForm } from "./partner-form";
import { DeletePartnerDialog } from "./delete-partner-dialog";
import { API } from "@/lib/api";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Download, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export function PartnerList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");  
  const { data: partners, isLoading, error } = useQuery({
    queryKey: ['/api/v1/partners/'],
    staleTime: 10000
  });

  const filteredPartners = partners ? partners.filter((partner: any) => {
    const matchesSearch = !searchQuery ||
      partner.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.inn.toLowerCase().includes(searchQuery.toLowerCase());
        
    return matchesSearch;
  }) : [];

  const handleViewPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowViewModal(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowEditModal(true);
  };

  const handleDeletePartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDeleteDialog(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPartner(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedPartner(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6 rounded-lg">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Управление партнерами</h1>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 gap-4">
              <div className="relative">
                <Input
                  type="text"                  
                  placeholder="Поиск партнеров..."
                  className="w-full md:w-64 pl-10"                
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Добавить
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex items-center gap-2">        
         
          <div className="flex border rounded-md overflow-hidden">
            <Button variant="ghost" size="sm" className="rounded-none border-r"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-none bg-gray-50">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Сетка партнеров */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 flex-row-reverse">                  
                  <Skeleton className="w-10 h-10 rounded-full" />                                    
                  <div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-6" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
              <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t border-gray-200">
                  <Skeleton className="h-8 w-8 rounded-full" />                  
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Ошибка загрузки партнеров. Попробуйте еще раз.
        </div>
      ) : filteredPartners?.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center p-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />              
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">Партнеры не найдены</h3>
          <p className="text-gray-500 mb-4">Попробуйте изменить фильтры или поисковые запросы</p>
          <Button onClick={() => {
            setSearchQuery("");            
          }}>
            Сбросить фильтры
          </Button>
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner: Partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onView={handleViewPartner}
              onEdit={handleEditPartner}
              onDelete={handleDeletePartner}
            />
          ))}
        </div>
      )}

      {filteredPartners && filteredPartners.length > 0 && (
        <div className="mt-8 flex justify-between items-center" >
          <div className="text-sm text-gray-700">
            Показано <span className="font-medium">1</span> -{" "}
            <span className="font-medium">{filteredPartners.length}</span> из{" "}
            <span className="font-medium">{(partners || []).length}</span> результатов
          </div>
          <div className="flex items-center gap-2" >
            <Button variant="outline" size="sm" disabled>              
              Предыдущая
            </Button>
            <Button variant="outline" size="sm" className="bg-primary-50 text-primary-700">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Следующая
            </Button>            
          </div>
        </div>
      )}

      {/* Модальное окно добавления */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Добавить партнера</DialogTitle>
          </DialogHeader>
          <PartnerForm 
            onClose={handleCloseAddModal} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/v1/partners/'] });
              handleCloseAddModal();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Модальное окно изменения */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Изменить партнера</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <PartnerForm 
              partner={selectedPartner}
              onClose={handleCloseEditModal}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/v1/partners/'] });
                handleCloseEditModal();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалоговое окно удаления */}
      <DeletePartnerDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        partner={selectedPartner}
        onClose={handleCloseDeleteDialog}
        onDelete={() => {queryClient.invalidateQueries({ queryKey: ['/api/v1/partners/'] });handleCloseDeleteDialog();}}
      />
    </div>
  );
}
