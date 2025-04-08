import { apiRequest } from "@/lib/queryClient";
import { 
  PartnerResponse, InsertPartner, Partner,
  UserResponse, InsertUser,
  ClientResponse, InsertClient,
  LicenseResponse, InsertLicense,
  DeviceResponse, InsertDevice,
  UpdateResponse, InsertUpdate
} from "@shared/schema";

export const API = {
  // Partners API
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
  },
  
  // Users API
  users: {
    getAll: async (): Promise<UserResponse[]> => {
      const res = await apiRequest("GET", "/api/v1/users/", undefined);
      return res.json();
    },
    
    getById: async (id: number): Promise<UserResponse> => {
      const res = await apiRequest("GET", `/api/v1/users/${id}`, undefined);
      return res.json();
    },
    
    create: async (user: InsertUser): Promise<UserResponse> => {
      const res = await apiRequest("POST", "/api/v1/users/", user);
      return res.json();
    },
    
    update: async (id: number, user: Partial<UserResponse>): Promise<UserResponse> => {
      const res = await apiRequest("PUT", `/api/v1/users/${id}`, user);
      return res.json();
    },
    
    delete: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/v1/users/${id}`, undefined);
    }
  },
  
  // Clients API
  clients: {
    getAll: async (): Promise<ClientResponse[]> => {
      const res = await apiRequest("GET", "/api/v1/clients/", undefined);
      return res.json();
    },
    
    getById: async (id: number): Promise<ClientResponse> => {
      const res = await apiRequest("GET", `/api/v1/clients/${id}`, undefined);
      return res.json();
    },
    
    create: async (client: InsertClient): Promise<ClientResponse> => {
      const res = await apiRequest("POST", "/api/v1/clients/", client);
      return res.json();
    },
    
    update: async (id: number, client: Partial<ClientResponse>): Promise<ClientResponse> => {
      const res = await apiRequest("PUT", `/api/v1/clients/${id}`, client);
      return res.json();
    },
    
    delete: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/v1/clients/${id}`, undefined);
    }
  },
  
  // Licenses API
  licenses: {
    getAll: async (): Promise<LicenseResponse[]> => {
      const res = await apiRequest("GET", "/api/v1/licenses/", undefined);
      return res.json();
    },
    
    getById: async (id: number): Promise<LicenseResponse> => {
      const res = await apiRequest("GET", `/api/v1/licenses/${id}`, undefined);
      return res.json();
    },
    
    create: async (license: InsertLicense): Promise<LicenseResponse> => {
      const res = await apiRequest("POST", "/api/v1/licenses/", license);
      return res.json();
    },
    
    update: async (id: number, license: Partial<LicenseResponse>): Promise<LicenseResponse> => {
      const res = await apiRequest("PUT", `/api/v1/licenses/${id}`, license);
      return res.json();
    },
    
    delete: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/v1/licenses/${id}`, undefined);
    }
  },
  
  // Devices API
  devices: {
    getAll: async (): Promise<DeviceResponse[]> => {
      const res = await apiRequest("GET", "/api/v1/devices/", undefined);
      return res.json();
    },
    
    getById: async (device_id: number): Promise<DeviceResponse> => {
      const res = await apiRequest("GET", `/api/v1/devices/${device_id}`, undefined);
      return res.json();
    },
    
    create: async (device: InsertDevice): Promise<DeviceResponse> => {
      const res = await apiRequest("POST", "/api/v1/devices/", device);
      return res.json();
    },
    
    update: async (device_id: number, device: Partial<DeviceResponse>): Promise<DeviceResponse> => {
      const res = await apiRequest("PUT", `/api/v1/devices/${device_id}`, device);
      return res.json();
    },
    
    delete: async (device_id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/v1/devices/${device_id}`, undefined);
    }
  },
  
  // Updates API
  updates: {
    getAll: async (): Promise<UpdateResponse[]> => {
      const res = await apiRequest("GET", "/api/v1/updates/", undefined);
      return res.json();
    },
    
    getById: async (id: number): Promise<UpdateResponse> => {
      const res = await apiRequest("GET", `/api/v1/updates/${id}`, undefined);
      return res.json();
    },
    
    create: async (update: InsertUpdate): Promise<UpdateResponse> => {
      const res = await apiRequest("POST", "/api/v1/updates/", update);
      return res.json();
    },
    
    update: async (id: number, update: Partial<UpdateResponse>): Promise<UpdateResponse> => {
      const res = await apiRequest("PUT", `/api/v1/updates/${id}`, update);
      return res.json();
    },
    
    delete: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/v1/updates/${id}`, undefined);
    }
  }
};
