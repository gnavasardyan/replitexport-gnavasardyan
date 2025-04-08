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
  partner_name: text("partner_name").notNull(),
  inn: text("inn").notNull(),
  kpp: text("kpp").notNull(),
  ogrn: text("ogrn").notNull(),
  address: text("address").notNull(),
  email: text("email").notNull(),
  apitoken: text("apitoken").notNull(),
  status: text("status").notNull().default("active"),
  type: text("type").notNull().default("provider"),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export const partnerResponseSchema = z.object({
  id: z.number(),
  partner_name: z.string(),
  inn: z.string(),
  kpp: z.string(),
  ogrn: z.string(),
  address: z.string(),
  email: z.string().email(),
  apitoken: z.string(),
  status: z.string().optional(),
  type: z.string().optional(),
});

export const partnerFormSchema = insertPartnerSchema.extend({
  partner_name: z.string().min(2, "Наименование партнера обязательно"),
  inn: z.string().min(10, "ИНН обязателен и должен содержать не менее 10 символов"),
  kpp: z.string().min(9, "КПП обязателен и должен содержать не менее 9 символов"),
  ogrn: z.string().min(13, "ОГРН обязателен и должен содержать не менее 13 символов"),
  address: z.string().min(5, "Адрес обязателен"),
  email: z.string().email("Необходим действительный адрес электронной почты"),
  apitoken: z.string().min(6, "API-токен обязателен и должен содержать не менее 6 символов"),
});

export type PartnerResponse = z.infer<typeof partnerResponseSchema>;

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  partner_id: integer("partner_id").notNull(),
  client_name: text("client_name").notNull(),
  inn: text("inn").notNull(),
  type: text("type").notNull().default("COMPANY"),
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
  partner_id: z.number(),
  client_name: z.string(),
  inn: z.string(),
  type: z.string(),
  createdAt: z.date().optional(),
});

export const clientFormSchema = insertClientSchema.extend({
  partner_id: z.number({required_error: "Выберите партнера"}),
  client_name: z.string().min(2, "Наименование клиента обязательно"),
  inn: z.string().min(10, "ИНН обязателен и должен содержать не менее 10 символов"),
  type: z.string({required_error: "Выберите тип клиента"}).default("COMPANY"),
});

export type ClientResponse = z.infer<typeof clientResponseSchema>;

// License schema
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").notNull(),
  license_key: text("license_key").notNull().unique(),
  status: text("status").notNull().default("AVAIL"),
  issuedDate: timestamp("issued_date").defaultNow(),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  issuedDate: true,
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

export const licenseResponseSchema = z.object({
  id: z.number(),
  client_id: z.number(),
  license_key: z.string(),
  status: z.string(),
  issuedDate: z.date().optional(),
});

export const licenseFormSchema = insertLicenseSchema.extend({
  client_id: z.number({required_error: "Выберите клиента"}),
  license_key: z.string().min(6, "Лицензионный ключ обязателен и должен содержать не менее 6 символов"),
  status: z.enum(["AVAIL", "USED", "BLOCKED"], {
    required_error: "Выберите статус лицензии",
  }).default("AVAIL"),
});

export const LicenseStatusOptions = [
  { label: "Доступна", value: "AVAIL" },
  { label: "Используется", value: "USED" },
  { label: "Заблокирована", value: "BLOCKED" },
];

export type LicenseResponse = z.infer<typeof licenseResponseSchema>;

// Device schema
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  license_id: integer("license_id").notNull(),
  inst_id: text("inst_id").notNull().unique(),
  os_version: text("os_version").notNull(),
  lm_version: text("lm_version").notNull(),
  local_id: text("local_id").notNull(),
  status: text("status").default("not_configured"),
  registeredDate: timestamp("registered_date").defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  registeredDate: true,
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export const deviceResponseSchema = z.object({
  id: z.number(),
  license_id: z.number(),
  inst_id: z.string(),
  os_version: z.string(),
  lm_version: z.string(),
  local_id: z.string(),
  status: z.string(),
  registeredDate: z.date().optional(),
});

export const deviceFormSchema = insertDeviceSchema.extend({
  license_id: z.number({required_error: "Выберите лицензию"}),
  inst_id: z.string().min(4, "ID установки обязателен"),
  os_version: z.string().min(2, "Версия ОС обязательна"),
  lm_version: z.string().min(2, "Версия LM обязательна"),
  local_id: z.string().min(4, "Локальный ID обязателен"),
  status: z.enum(["not_configured", "initialization", "ready", "sync_error"], {
    required_error: "Выберите статус устройства",
  }).default("not_configured"),
});

export const DeviceStatusOptions = [
  { label: "Не настроено", value: "not_configured" },
  { label: "Инициализация", value: "initialization" },
  { label: "Готово", value: "ready" },
  { label: "Ошибка синхронизации", value: "sync_error" },
];

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
