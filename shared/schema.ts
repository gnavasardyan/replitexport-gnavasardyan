import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  createdAt: z.date().optional(),
  status: z.enum(["ACTIVE", "CREATED", "CONFIRMED"]).optional(),
  last_logon_time: z.date().optional(),
  email_confirm_token: z.string().optional(),
  partner_id: z.number().optional(),
  client_id: z.number().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

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

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  status: text("status").default("active"),
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export const clientResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  contactPerson: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string().optional(),
  industry: z.string().optional(),
  createdAt: z.date().optional(),
});

export type ClientResponse = z.infer<typeof clientResponseSchema>;

// License schema
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  licenseKey: text("license_key").notNull().unique(),
  clientId: integer("client_id"),
  issuedDate: timestamp("issued_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  status: text("status").default("active"),
  features: text("features"),
  maxDevices: integer("max_devices").default(1),
  notes: text("notes"),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  issuedDate: true,
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

export const licenseResponseSchema = z.object({
  id: z.number(),
  licenseKey: z.string(),
  clientId: z.number().optional(),
  issuedDate: z.date().optional(),
  expiryDate: z.date().optional(),
  status: z.string().optional(),
  features: z.string().optional(),
  maxDevices: z.number().optional(),
  notes: z.string().optional(),
});

export type LicenseResponse = z.infer<typeof licenseResponseSchema>;

// Device schema
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  licenseId: integer("license_id"),
  name: text("name"),
  model: text("model"),
  serialNumber: text("serial_number"),
  status: text("status").default("active"),
  lastCheckin: timestamp("last_checkin"),
  macAddress: text("mac_address"),
  ipAddress: text("ip_address"),
  registeredDate: timestamp("registered_date").defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  registeredDate: true,
  lastCheckin: true,
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export const deviceResponseSchema = z.object({
  id: z.number(),
  deviceId: z.string(),
  licenseId: z.number().optional(),
  name: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.string().optional(),
  lastCheckin: z.date().optional(),
  macAddress: z.string().optional(),
  ipAddress: z.string().optional(),
  registeredDate: z.date().optional(),
});

export type DeviceResponse = z.infer<typeof deviceResponseSchema>;

// Update schema
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  releaseDate: timestamp("release_date").defaultNow(),
  title: text("title").notNull(),
  description: text("description"),
  downloadUrl: text("download_url"),
  isRequired: boolean("is_required").default(false),
  releaseNotes: text("release_notes"),
  size: text("size"),
});

export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true,
  releaseDate: true,
});

export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;

export const updateResponseSchema = z.object({
  id: z.number(),
  version: z.string(),
  releaseDate: z.date().optional(),
  title: z.string(),
  description: z.string().optional(),
  downloadUrl: z.string().optional(),
  isRequired: z.boolean().optional(),
  releaseNotes: z.string().optional(),
  size: z.string().optional(),
});

export type UpdateResponse = z.infer<typeof updateResponseSchema>;
