import { 
  users, type User, type InsertUser, type UserResponse,
  PartnerResponse, InsertPartner,
  ClientResponse, InsertClient,
  LicenseResponse, InsertLicense,
  DeviceResponse, InsertDevice,
  UpdateResponse, InsertUpdate
} from "@shared/schema";

export interface IStorage {
  // User methods
  getAllUsers(): Promise<UserResponse[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<UserResponse>): Promise<UserResponse>;
  deleteUser(id: number): Promise<void>;
  
  // Partner methods
  getAllPartners(): Promise<PartnerResponse[]>;
  getPartnerById(id: number): Promise<PartnerResponse | undefined>;
  createPartner(partner: InsertPartner): Promise<PartnerResponse>;
  updatePartner(id: number, partnerData: Partial<PartnerResponse>): Promise<PartnerResponse>;
  deletePartner(id: number): Promise<void>;
  
  // Client methods
  getAllClients(): Promise<ClientResponse[]>;
  getClientById(id: number): Promise<ClientResponse | undefined>;
  createClient(client: InsertClient): Promise<ClientResponse>;
  updateClient(id: number, clientData: Partial<ClientResponse>): Promise<ClientResponse>;
  deleteClient(id: number): Promise<void>;
  
  // License methods
  getAllLicenses(): Promise<LicenseResponse[]>;
  getLicenseById(id: number): Promise<LicenseResponse | undefined>;
  createLicense(license: InsertLicense): Promise<LicenseResponse>;
  updateLicense(id: number, licenseData: Partial<LicenseResponse>): Promise<LicenseResponse>;
  deleteLicense(id: number): Promise<void>;
  
  // Device methods
  getAllDevices(): Promise<DeviceResponse[]>;
  getDeviceById(id: number): Promise<DeviceResponse | undefined>;
  createDevice(device: InsertDevice): Promise<DeviceResponse>;
  updateDevice(id: number, deviceData: Partial<DeviceResponse>): Promise<DeviceResponse>;
  deleteDevice(id: number): Promise<void>;
  
  // Update methods
  getAllUpdates(): Promise<UpdateResponse[]>;
  getUpdateById(id: number): Promise<UpdateResponse | undefined>;
  createUpdate(update: InsertUpdate): Promise<UpdateResponse>;
  updateUpdate(id: number, updateData: Partial<UpdateResponse>): Promise<UpdateResponse>;
  deleteUpdate(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, UserResponse>;
  private partners: Map<number, PartnerResponse>;
  private clients: Map<number, ClientResponse>;
  private licenses: Map<number, LicenseResponse>;
  private devices: Map<number, DeviceResponse>;
  private updates: Map<number, UpdateResponse>;
  
  userCurrentId: number;
  partnerCurrentId: number;
  clientCurrentId: number;
  licenseCurrentId: number;
  deviceCurrentId: number;
  updateCurrentId: number;

  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.clients = new Map();
    this.licenses = new Map();
    this.devices = new Map();
    this.updates = new Map();
    
    this.userCurrentId = 1;
    this.partnerCurrentId = 1;
    this.clientCurrentId = 1;
    this.licenseCurrentId = 1;
    this.deviceCurrentId = 1;
    this.updateCurrentId = 1;
    
    // Add some sample partners
    this.createPartner({
      name: "Acme Corporation",
      type: "supplier",
      status: "active",
      email: "contact@acmecorp.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      joinedDate: "Jan 15, 2022",
      contractCount: "3 Active",
      address: "123 Business Ave, New York, NY 10001"
    });
    
    this.createPartner({
      name: "Global Logistics",
      type: "distributor", 
      status: "pending",
      email: "info@globallogistics.com",
      phone: "+1 (555) 987-6543",
      location: "Chicago, USA",
      joinedDate: "Mar 22, 2022",
      contractCount: "1 Pending",
      address: "456 Shipping Lane, Chicago, IL 60611"
    });
    
    this.createPartner({
      name: "Tech Retailers Inc.",
      type: "retailer",
      status: "suspended",
      email: "partners@techretailers.com",
      phone: "+1 (555) 456-7890",
      location: "San Francisco, USA",
      joinedDate: "Dec 05, 2021",
      contractCount: "2 On Hold",
      address: "789 Tech Boulevard, San Francisco, CA 94105"
    });
  }

  // User methods
  async getAllUsers(): Promise<UserResponse[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id) as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    ) as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;    
    const user: UserResponse = { ...insertUser, id, client_id: 1, email_confirm_token: 'test', last_logon_time: null };
    

    this.users.set(id, user);
    return user as User;
  }
  
  async updateUser(id: number, userData: Partial<UserResponse>): Promise<UserResponse> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: UserResponse = {
      ...existingUser,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`);
    }
    
    this.users.delete(id);
  }
  
  // Partner methods
  async getAllPartners(): Promise<PartnerResponse[]> {
    return Array.from(this.partners.values());
  }
  
  async getPartnerById(id: number): Promise<PartnerResponse | undefined> {
    return this.partners.get(id);
  }
  
  async createPartner(insertPartner: InsertPartner): Promise<PartnerResponse> {
    const id = this.partnerCurrentId++;
    const partner: PartnerResponse = { ...insertPartner, id };
    this.partners.set(id, partner);
    return partner;
  }
  
  async updatePartner(id: number, partnerData: Partial<PartnerResponse>): Promise<PartnerResponse> {
    const existingPartner = this.partners.get(id);
    
    if (!existingPartner) {
      throw new Error(`Partner with id ${id} not found`);
    }
    
    const updatedPartner: PartnerResponse = {
      ...existingPartner,
      ...partnerData
    };
    
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }
  
  async deletePartner(id: number): Promise<void> {
    if (!this.partners.has(id)) {
      throw new Error(`Partner with id ${id} not found`);
    }
    
    this.partners.delete(id);
  }
  
  // Client methods
  async getAllClients(): Promise<ClientResponse[]> {
    return Array.from(this.clients.values());
  }
  
  async getClientById(id: number): Promise<ClientResponse | undefined> {
    return this.clients.get(id);
  }
  
  async createClient(insertClient: InsertClient): Promise<ClientResponse> {
    const id = this.clientCurrentId++;
    const client: ClientResponse = { ...insertClient, id, createdAt: new Date() };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<ClientResponse>): Promise<ClientResponse> {
    const existingClient = this.clients.get(id);
    
    if (!existingClient) {
      throw new Error(`Client with id ${id} not found`);
    }
    
    const updatedClient: ClientResponse = {
      ...existingClient,
      ...clientData
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<void> {
    if (!this.clients.has(id)) {
      throw new Error(`Client with id ${id} not found`);
    }
    
    this.clients.delete(id);
  }
  
  // License methods
  async getAllLicenses(): Promise<LicenseResponse[]> {
    return Array.from(this.licenses.values());
  }
  
  async getLicenseById(id: number): Promise<LicenseResponse | undefined> {
    return this.licenses.get(id);
  }
  
  async createLicense(insertLicense: InsertLicense): Promise<LicenseResponse> {
    const id = this.licenseCurrentId++;
    const license: LicenseResponse = { ...insertLicense, id, issuedDate: new Date() };
    this.licenses.set(id, license);
    return license;
  }
  
  async updateLicense(id: number, licenseData: Partial<LicenseResponse>): Promise<LicenseResponse> {
    const existingLicense = this.licenses.get(id);
    
    if (!existingLicense) {
      throw new Error(`License with id ${id} not found`);
    }
    
    const updatedLicense: LicenseResponse = {
      ...existingLicense,
      ...licenseData
    };
    
    this.licenses.set(id, updatedLicense);
    return updatedLicense;
  }
  
  async deleteLicense(id: number): Promise<void> {
    if (!this.licenses.has(id)) {
      throw new Error(`License with id ${id} not found`);
    }
    
    this.licenses.delete(id);
  }
  
  // Device methods
  async getAllDevices(): Promise<DeviceResponse[]> {
    return Array.from(this.devices.values());
  }
  
  async getDeviceById(id: number): Promise<DeviceResponse | undefined> {
    return this.devices.get(id);
  }
  
  async createDevice(insertDevice: InsertDevice): Promise<DeviceResponse> {
    const id = this.deviceCurrentId++;
    const device: DeviceResponse = { 
      ...insertDevice, 
      id, 
      registeredDate: new Date() 
    };
    this.devices.set(id, device);
    return device;
  }
  
  async updateDevice(id: number, deviceData: Partial<DeviceResponse>): Promise<DeviceResponse> {
    const existingDevice = this.devices.get(id);
    
    if (!existingDevice) {
      throw new Error(`Device with id ${id} not found`);
    }
    
    const updatedDevice: DeviceResponse = {
      ...existingDevice,
      ...deviceData
    };
    
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }
  
  async deleteDevice(id: number): Promise<void> {
    if (!this.devices.has(id)) {
      throw new Error(`Device with id ${id} not found`);
    }
    
    this.devices.delete(id);
  }
  
  // Update methods
  async getAllUpdates(): Promise<UpdateResponse[]> {
    return Array.from(this.updates.values());
  }
  
  async getUpdateById(id: number): Promise<UpdateResponse | undefined> {
    return this.updates.get(id);
  }
  
  async createUpdate(insertUpdate: InsertUpdate): Promise<UpdateResponse> {
    const id = this.updateCurrentId++;
    const update: UpdateResponse = { 
      ...insertUpdate, 
      id, 
      releaseDate: new Date() 
    };
    this.updates.set(id, update);
    return update;
  }
  
  async updateUpdate(id: number, updateData: Partial<UpdateResponse>): Promise<UpdateResponse> {
    const existingUpdate = this.updates.get(id);
    
    if (!existingUpdate) {
      throw new Error(`Update with id ${id} not found`);
    }
    
    const updatedUpdate: UpdateResponse = {
      ...existingUpdate,
      ...updateData
    };
    
    this.updates.set(id, updatedUpdate);
    return updatedUpdate;
  }
  
  async deleteUpdate(id: number): Promise<void> {
    if (!this.updates.has(id)) {
      throw new Error(`Update with id ${id} not found`);
    }
    
    this.updates.delete(id);
  }
}

export const storage = new MemStorage();
