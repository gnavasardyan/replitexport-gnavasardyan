export interface Partner {
  id: number;
  name: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  location?: string;
  joinedDate: string;
  contractCount?: string;
  address?: string;
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
