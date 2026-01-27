export type ChecklistStatus = "done" | "pending" | "rfi" | "warning" | "na";

export interface Project {
  id: string;
  name: string;
  location: string;
  bid_date: string;
  status: "Setup" | "In Progress" | "Review" | "Submitted";
  progress: number;
  gc: string;
  sqft: number;
  assemblies: string[];
  user_id: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  project_id: string;
  phase: string;
  phase_number: number;
  item_text: string;
  status: ChecklistStatus;
  order_index: number;
}

export interface ChecklistPhase {
  key: string;
  title: string;
  icon: string;
  critical?: boolean;
  criticalRule?: string;
  items: ChecklistItemLocal[];
}

export interface ChecklistItemLocal {
  id: string;
  text: string;
  status: ChecklistStatus;
}

export interface VendorGroup {
  key: string;
  name: string;
  vendors: Vendor[];
  products: string[];
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastQuote: string | null;
  quoteStatus: "valid" | "expiring" | "expired" | "none";
  expires?: string;
}

export interface VendorQuote {
  id: string;
  project_id: string;
  vendor_name: string;
  vendor_email: string;
  material_group: string;
  products: string[];
  price: number;
  unit: string;
  quote_date: string | null;
  expiry_date: string | null;
  status: "valid" | "expiring" | "expired" | "none";
}

export interface LaborRate {
  id: string;
  project_id?: string;
  category: string;
  task: string;
  rate: number;
  unit: string;
  crew: number;
  notes: string;
}

export interface MaterialPrice {
  product: string;
  price: number;
  unit: string;
  coverage: number;
  coverageUnit: string;
  quoteDate: string | null;
  vendor: string | null;
}

export interface Datasheet {
  id: string;
  project_id?: string;
  name: string;
  url: string;
  category: string;
  uploaded_at: string;
}

export interface ValidationResult {
  passed: ValidationItem[];
  warnings: ValidationItem[];
  errors: ValidationItem[];
}

export interface ValidationItem {
  type: string;
  item: string;
  message: string;
  action?: string;
}
