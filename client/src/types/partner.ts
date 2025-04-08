export interface Partner {
  id: number;
  partner_name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  email: string;
  apitoken: string;
  type?: string;
  status?: string;
}

export type PartnerResponse = Partner;

export type InsertPartner = Omit<Partner, "id">;

export const PartnerTypes = [
  { label: "Supplier", value: "supplier" },
  { label: "Distributor", value: "distributor" },
  { label: "Retailer", value: "retailer" }
];

export const PartnerStatuses = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" }
];
