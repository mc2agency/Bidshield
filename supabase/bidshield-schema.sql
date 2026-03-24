-- BidShield Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  bid_date DATE,
  status TEXT DEFAULT 'Setup' CHECK (status IN ('Setup', 'In Progress', 'Review', 'Submitted')),
  progress INTEGER DEFAULT 0,
  gc TEXT,
  sqft INTEGER,
  assemblies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Assemblies
CREATE TABLE project_assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  area_sqft NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist Items (18-phase system)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  phase TEXT NOT NULL,
  phase_number INTEGER NOT NULL,
  item_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('done', 'pending', 'rfi', 'warning', 'na')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Quotes
CREATE TABLE vendor_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  vendor_phone TEXT,
  material_group TEXT NOT NULL,
  products TEXT[] DEFAULT '{}',
  total_price NUMERIC,
  unit TEXT,
  quote_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'none' CHECK (status IN ('valid', 'expiring', 'expired', 'none')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labor Rates
CREATE TABLE labor_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  task TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  crew_size INTEGER DEFAULT 1,
  productivity_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datasheets
CREATE TABLE datasheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  category TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation Results
CREATE TABLE validation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  passed JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  errors JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  run_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Prices (reference table)
CREATE TABLE material_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  coverage NUMERIC,
  coverage_unit TEXT,
  vendor TEXT,
  quote_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own checklist items" ON checklist_items
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can CRUD own vendor quotes" ON vendor_quotes
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can CRUD own labor rates" ON labor_rates
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can CRUD own datasheets" ON datasheets
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can CRUD own validation results" ON validation_results
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can CRUD own project assemblies" ON project_assemblies
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_checklist_project ON checklist_items(project_id);
CREATE INDEX idx_quotes_project ON vendor_quotes(project_id);
CREATE INDEX idx_labor_project ON labor_rates(project_id);
CREATE INDEX idx_datasheets_project ON datasheets(project_id);
CREATE INDEX idx_validation_project ON validation_results(project_id);
