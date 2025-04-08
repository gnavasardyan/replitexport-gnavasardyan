import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  partnerResponseSchema, insertPartnerSchema,
  userResponseSchema, insertUserSchema, UserResponse,
  clientResponseSchema, insertClientSchema,
  licenseResponseSchema, insertLicenseSchema,
  deviceResponseSchema, insertDeviceSchema,
  updateResponseSchema, insertUpdateSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const API_PREFIX = "/api/v1";

  // GET /api/v1/partners - Get all partners
  app.get(`${API_PREFIX}/partners/`, async (req: Request, res: Response) => {
    try {
      const partners = await storage.getAllPartners();
      return res.status(200).json(partners);
    } catch (error) {
      console.error("Error getting partners:", error);
      return res.status(500).json({ message: "Failed to get partners" });
    }
  });

  // GET /api/v1/partners/:id - Get partner by ID
  app.get(`${API_PREFIX}/partners/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const partner = await storage.getPartnerById(id);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      return res.status(200).json(partner);
    } catch (error) {
      console.error(`Error getting partner ${id}:`, error);
      return res.status(500).json({ message: "Failed to get partner" });
    }
  });

  // POST /api/v1/partners - Create new partner
  app.post(`${API_PREFIX}/partners/`, async (req: Request, res: Response) => {
    try {
      const partnerData = insertPartnerSchema.parse(req.body);
      const newPartner = await storage.createPartner(partnerData);
      return res.status(201).json(newPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid partner data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating partner:", error);
      return res.status(500).json({ message: "Failed to create partner" });
    }
  });

  // PUT /api/v1/partners/:id - Update partner
  app.put(`${API_PREFIX}/partners/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      // Partial validation to allow updating only some fields
      const partnerData = partnerResponseSchema.partial().parse(req.body);
      
      const existingPartner = await storage.getPartnerById(id);
      
      if (!existingPartner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      const updatedPartner = await storage.updatePartner(id, partnerData);
      return res.status(200).json(updatedPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid partner data", 
          errors: error.errors 
        });
      }
      
      console.error(`Error updating partner ${id}:`, error);
      return res.status(500).json({ message: "Failed to update partner" });
    }
  });

  // DELETE /api/v1/partners/:id - Delete partner
  app.delete(`${API_PREFIX}/partners/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const partner = await storage.getPartnerById(id);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      await storage.deletePartner(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Error deleting partner ${id}:`, error);
      return res.status(500).json({ message: "Failed to delete partner" });
    }
  });

  // User Routes
  // GET /api/v1/users - Get all users
  app.get(`${API_PREFIX}/users/`, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Map users to UserResponse objects (without passwords)
      const userResponses = users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }));
      return res.status(200).json(userResponses);
    } catch (error) {
      console.error("Error getting users:", error);
      return res.status(500).json({ message: "Failed to get users" });
    }
  });

  // GET /api/v1/users/:id - Get user by ID
  app.get(`${API_PREFIX}/users/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a UserResponse object without password for the response
      const userResponse: UserResponse = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };
      return res.status(200).json(userResponse);
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      return res.status(500).json({ message: "Failed to get user" });
    }
  });

  // POST /api/v1/users - Create new user
  app.post(`${API_PREFIX}/users/`, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      
      // Create a UserResponse object without password for the response
      const userResponse: UserResponse = {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };
      return res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  // PUT /api/v1/users/:id - Update user
  app.put(`${API_PREFIX}/users/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const userData = userResponseSchema.partial().parse(req.body);
      
      const existingUser = await storage.getUser(id);
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      // Just return the user response (password is already excluded in userResponseSchema)
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      
      console.error(`Error updating user ${id}:`, error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  });

  // DELETE /api/v1/users/:id - Delete user
  app.delete(`${API_PREFIX}/users/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.deleteUser(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Client Routes
  // GET /api/v1/clients - Get all clients
  app.get(`${API_PREFIX}/clients/`, async (req: Request, res: Response) => {
    try {
      const clients = await storage.getAllClients();
      return res.status(200).json(clients);
    } catch (error) {
      console.error("Error getting clients:", error);
      return res.status(500).json({ message: "Failed to get clients" });
    }
  });

  // GET /api/v1/clients/:id - Get client by ID
  app.get(`${API_PREFIX}/clients/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const client = await storage.getClientById(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      return res.status(200).json(client);
    } catch (error) {
      console.error(`Error getting client ${id}:`, error);
      return res.status(500).json({ message: "Failed to get client" });
    }
  });

  // POST /api/v1/clients - Create new client
  app.post(`${API_PREFIX}/clients/`, async (req: Request, res: Response) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(clientData);
      return res.status(201).json(newClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid client data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating client:", error);
      return res.status(500).json({ message: "Failed to create client" });
    }
  });

  // PUT /api/v1/clients/:id - Update client
  app.put(`${API_PREFIX}/clients/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const clientData = clientResponseSchema.partial().parse(req.body);
      
      const existingClient = await storage.getClientById(id);
      
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const updatedClient = await storage.updateClient(id, clientData);
      return res.status(200).json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid client data", 
          errors: error.errors 
        });
      }
      
      console.error(`Error updating client ${id}:`, error);
      return res.status(500).json({ message: "Failed to update client" });
    }
  });

  // DELETE /api/v1/clients/:id - Delete client
  app.delete(`${API_PREFIX}/clients/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const client = await storage.getClientById(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      await storage.deleteClient(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      return res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // License Routes
  // GET /api/v1/licenses - Get all licenses
  app.get(`${API_PREFIX}/licenses/`, async (req: Request, res: Response) => {
    try {
      const licenses = await storage.getAllLicenses();
      return res.status(200).json(licenses);
    } catch (error) {
      console.error("Error getting licenses:", error);
      return res.status(500).json({ message: "Failed to get licenses" });
    }
  });

  // GET /api/v1/licenses/:id - Get license by ID
  app.get(`${API_PREFIX}/licenses/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const license = await storage.getLicenseById(id);
      
      if (!license) {
        return res.status(404).json({ message: "License not found" });
      }
      
      return res.status(200).json(license);
    } catch (error) {
      console.error(`Error getting license ${id}:`, error);
      return res.status(500).json({ message: "Failed to get license" });
    }
  });

  // POST /api/v1/licenses - Create new license
  app.post(`${API_PREFIX}/licenses/`, async (req: Request, res: Response) => {
    try {
      const licenseData = insertLicenseSchema.parse(req.body);
      const newLicense = await storage.createLicense(licenseData);
      return res.status(201).json(newLicense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid license data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating license:", error);
      return res.status(500).json({ message: "Failed to create license" });
    }
  });

  // PUT /api/v1/licenses/:id - Update license
  app.put(`${API_PREFIX}/licenses/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const licenseData = licenseResponseSchema.partial().parse(req.body);
      
      const existingLicense = await storage.getLicenseById(id);
      
      if (!existingLicense) {
        return res.status(404).json({ message: "License not found" });
      }
      
      const updatedLicense = await storage.updateLicense(id, licenseData);
      return res.status(200).json(updatedLicense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid license data", 
          errors: error.errors 
        });
      }
      
      console.error(`Error updating license ${id}:`, error);
      return res.status(500).json({ message: "Failed to update license" });
    }
  });

  // DELETE /api/v1/licenses/:id - Delete license
  app.delete(`${API_PREFIX}/licenses/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const license = await storage.getLicenseById(id);
      
      if (!license) {
        return res.status(404).json({ message: "License not found" });
      }
      
      await storage.deleteLicense(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Error deleting license ${id}:`, error);
      return res.status(500).json({ message: "Failed to delete license" });
    }
  });

  // Device Routes
  // GET /api/v1/devices - Get all devices
  app.get(`${API_PREFIX}/devices/`, async (req: Request, res: Response) => {
    try {
      const devices = await storage.getAllDevices();
      return res.status(200).json(devices);
    } catch (error) {
      console.error("Error getting devices:", error);
      return res.status(500).json({ message: "Failed to get devices" });
    }
  });

  // GET /api/v1/devices/:id - Get device by ID
  app.get(`${API_PREFIX}/devices/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const device = await storage.getDeviceById(id);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      return res.status(200).json(device);
    } catch (error) {
      console.error(`Error getting device ${id}:`, error);
      return res.status(500).json({ message: "Failed to get device" });
    }
  });

  // POST /api/v1/devices - Create new device
  app.post(`${API_PREFIX}/devices/`, async (req: Request, res: Response) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const newDevice = await storage.createDevice(deviceData);
      return res.status(201).json(newDevice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid device data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating device:", error);
      return res.status(500).json({ message: "Failed to create device" });
    }
  });

  // PUT /api/v1/devices/:id - Update device
  app.put(`${API_PREFIX}/devices/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const deviceData = deviceResponseSchema.partial().parse(req.body);
      
      const existingDevice = await storage.getDeviceById(id);
      
      if (!existingDevice) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const updatedDevice = await storage.updateDevice(id, deviceData);
      return res.status(200).json(updatedDevice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid device data", 
          errors: error.errors 
        });
      }
      
      console.error(`Error updating device ${id}:`, error);
      return res.status(500).json({ message: "Failed to update device" });
    }
  });

  // DELETE /api/v1/devices/:id - Delete device
  app.delete(`${API_PREFIX}/devices/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const device = await storage.getDeviceById(id);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      await storage.deleteDevice(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Error deleting device ${id}:`, error);
      return res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Update Routes
  // GET /api/v1/updates - Get all updates
  app.get(`${API_PREFIX}/updates/`, async (req: Request, res: Response) => {
    try {
      const updates = await storage.getAllUpdates();
      return res.status(200).json(updates);
    } catch (error) {
      console.error("Error getting updates:", error);
      return res.status(500).json({ message: "Failed to get updates" });
    }
  });

  // GET /api/v1/updates/:id - Get update by ID
  app.get(`${API_PREFIX}/updates/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const update = await storage.getUpdateById(id);
      
      if (!update) {
        return res.status(404).json({ message: "Update not found" });
      }
      
      return res.status(200).json(update);
    } catch (error) {
      console.error(`Error getting update ${id}:`, error);
      return res.status(500).json({ message: "Failed to get update" });
    }
  });

  // POST /api/v1/updates - Create new update
  app.post(`${API_PREFIX}/updates/`, async (req: Request, res: Response) => {
    try {
      const updateData = insertUpdateSchema.parse(req.body);
      const newUpdate = await storage.createUpdate(updateData);
      return res.status(201).json(newUpdate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating update:", error);
      return res.status(500).json({ message: "Failed to create update" });
    }
  });

  // PUT /api/v1/updates/:id - Update update
  app.put(`${API_PREFIX}/updates/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const updateData = updateResponseSchema.partial().parse(req.body);
      
      const existingUpdate = await storage.getUpdateById(id);
      
      if (!existingUpdate) {
        return res.status(404).json({ message: "Update not found" });
      }
      
      const updatedUpdate = await storage.updateUpdate(id, updateData);
      return res.status(200).json(updatedUpdate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: error.errors 
        });
      }
      
      console.error(`Error updating update ${id}:`, error);
      return res.status(500).json({ message: "Failed to update update" });
    }
  });

  // DELETE /api/v1/updates/:id - Delete update
  app.delete(`${API_PREFIX}/updates/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const update = await storage.getUpdateById(id);
      
      if (!update) {
        return res.status(404).json({ message: "Update not found" });
      }
      
      await storage.deleteUpdate(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Error deleting update ${id}:`, error);
      return res.status(500).json({ message: "Failed to delete update" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
