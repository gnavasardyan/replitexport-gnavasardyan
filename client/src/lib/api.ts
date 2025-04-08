import { apiRequest } from "@/lib/queryClient";
import { PartnerResponse, InsertPartner, Partner } from "@/types/partner";

export const API = {
  partners: {
    getAll: async (): Promise<PartnerResponse[]> => {
      const res = await apiRequest("GET", "/api/v1/partners/", undefined);
      return res.json();
    },
    
    getById: async (id: number): Promise<PartnerResponse> => {
      const res = await apiRequest("GET", `/api/v1/partners/${id}`, undefined);
      return res.json();
    },
    
    create: async (partner: InsertPartner): Promise<PartnerResponse> => {
      const res = await apiRequest("POST", "/api/v1/partners/", partner);
      return res.json();
    },
    
    update: async (id: number, partner: Partial<Partner>): Promise<PartnerResponse> => {
      const res = await apiRequest("PUT", `/api/v1/partners/${id}`, partner);
      return res.json();
    },
    
    delete: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/v1/partners/${id}`, undefined);
    }
  }
};
