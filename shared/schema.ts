import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Partner schema
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location"),
  joinedDate: text("joined_date").notNull(),
  contractCount: text("contract_count"),
  address: text("address"),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export const partnerResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string().optional(),
  joinedDate: z.string(),
  contractCount: z.string().optional(),
  address: z.string().optional(),
});

export const partnerFormSchema = insertPartnerSchema.extend({
  name: z.string().min(2, "Partner name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Phone number is required"),
  type: z.string().min(1, "Partner type is required"),
});

export type PartnerResponse = z.infer<typeof partnerResponseSchema>;
