import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { partnerResponseSchema, insertPartnerSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
