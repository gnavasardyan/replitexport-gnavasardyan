import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PartnerResponse } from "@shared/schema";
import { PartnerForm } from "@/components/partners/partner-form";
import { Sidebar } from "@/components/layout/sidebar";

export default function Partners() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openAddPartner, setOpenAddPartner] = useState(false);
  const [openEditPartner, setOpenEditPartner] = useState(false);
  const [openDeletePartner, setOpenDeletePartner] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data: partners, isLoading, error } = useQuery({
    queryKey: ["/api/v1/partners"],
    queryFn: API.partners.getAll,
  });

  const handleAddPartner = () => {
    setOpenAddPartner(true);
  };

  const handleEditPartner = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setOpenEditPartner(true);
  };

  const handleDeletePartner = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setOpenDeletePartner(true);
  };

  const handleViewPartner = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setShowViewModal(true);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  const filteredPartners = partners?.filter(partner => 
    partner.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.inn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Партнеры</h1>
            <Button onClick={handleAddPartner} className="gap-2">
              <Plus size={16} />
              Добавить партнера
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск партнеров по названию или ИНН..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchQuery("")}
              >
                {searchQuery && <X size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Загрузка партнеров...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
            ) : !filteredPartners || filteredPartners.length === 0 ? (
              <div className="text-center py-8">
                {searchQuery ? "Нет результатов по вашему запросу" : "Нет данных о партнерах"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPartners.slice((page - 1) * 10, page * 10).map((partner: PartnerResponse) => (
                  <Card key={partner.partner_id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{partner.partner_name}</CardTitle>
                        <Badge variant="outline" className="bg-blue-500 text-white">
                          Партнер
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">ИНН:</span> {partner.inn}</p>
                        <p><span className="font-medium">Email:</span> {partner.email}</p>
                        <p><span className="font-medium">Адрес:</span> {partner.address}</p>
                        {partner.createdAt && (
                          <p><span className="font-medium">Создан:</span> {formatDate(partner.createdAt)}</p>
                        )}
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between pt-4">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewPartner(partner)}>
                        <Eye size={14} />
                        Просмотр
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => handleEditPartner(partner)}>
                          <Pencil size={14} />
                          Изменить
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => handleDeletePartner(partner)}>
                          <Trash2 size={14} />
                          Удалить
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Предыдущая
                  </Button>
                  <span className="mx-2">
                    Страница {page} из {Math.ceil(filteredPartners?.length / 10) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(Math.ceil(filteredPartners?.length / 10), p + 1))}
                    disabled={page >= Math.ceil(filteredPartners?.length / 10)}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* View Partner Dialog */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Просмотр партнера</DialogTitle>
              </DialogHeader>
              {selectedPartner && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Основная информация</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Наименование</p>
                        <p className="text-sm">{selectedPartner.partner_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ИНН</p>
                        <p className="text-sm">{selectedPartner.inn}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">КПП</p>
                        <p className="text-sm">{selectedPartner.kpp}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ОГРН</p>
                        <p className="text-sm">{selectedPartner.ogrn}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Контактная информация</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm">{selectedPartner.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Адрес</p>
                        <p className="text-sm">{selectedPartner.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Partner Dialog */}
          <Dialog open={openEditPartner} onOpenChange={setOpenEditPartner}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Изменить партнера</DialogTitle>
              </DialogHeader>
              {selectedPartner && (
                <PartnerForm
                  partner={selectedPartner}
                  onClose={() => {
                    setOpenEditPartner(false);
                    setSelectedPartner(null);
                  }}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/v1/partners"] });
                    setOpenEditPartner(false);
                    setSelectedPartner(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Partner Dialog */}
          <Dialog open={openDeletePartner} onOpenChange={setOpenDeletePartner}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Удалить партнера</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Вы уверены, что хотите удалить партнера "{selectedPartner?.partner_name}"?</p>
                <p className="text-sm text-gray-500 mt-2">Это действие нельзя отменить.</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenDeletePartner(false);
                    setSelectedPartner(null);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (selectedPartner) {
                      try {
                        await API.partners.delete(selectedPartner.partner_id);
                        queryClient.invalidateQueries({ queryKey: ["/api/v1/partners"] });
                        toast({
                          title: "Успех",
                          description: "Партнер успешно удален",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Ошибка",
                          description: `Не удалось удалить партнера: ${error.message}`,
                          variant: "destructive",
                        });
                      }
                      setOpenDeletePartner(false);
                      setSelectedPartner(null);
                    }
                  }}
                >
                  Удалить
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Partner Dialog */}
          <Dialog open={openAddPartner} onOpenChange={setOpenAddPartner}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Добавить партнера</DialogTitle>
              </DialogHeader>
              <PartnerForm
                onClose={() => {
                  setOpenAddPartner(false);
                }}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/v1/partners"] });
                  setOpenAddPartner(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}