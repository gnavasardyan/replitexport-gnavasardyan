import { users, type User, type InsertUser, PartnerResponse, InsertPartner } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Partner methods
  getAllPartners(): Promise<PartnerResponse[]>;
  getPartnerById(id: number): Promise<PartnerResponse | undefined>;
  createPartner(partner: InsertPartner): Promise<PartnerResponse>;
  updatePartner(id: number, partnerData: Partial<PartnerResponse>): Promise<PartnerResponse>;
  deletePartner(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partners: Map<number, PartnerResponse>;
  
  userCurrentId: number;
  partnerCurrentId: number;

  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.userCurrentId = 1;
    this.partnerCurrentId = 1;
    
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
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
