"use client";

import { masterChecklist } from "./checklist-data";

// Types
export interface Project {
  id: string;
  name: string;
  location: string;
  bidDate: string;
  bidTime?: string;
  status: "setup" | "in_progress" | "submitted" | "won" | "lost" | "no_bid";
  gc?: string;
  owner?: string;
  sqft?: number;
  totalBidAmount?: number;
  assemblies: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItem {
  phaseKey: string;
  itemId: string;
  status: "pending" | "done" | "rfi" | "na" | "warning";
  notes?: string;
}

export interface Quote {
  id: string;
  projectId?: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  category: string;
  products: string[];
  quoteAmount?: number;
  quoteDate?: string;
  expirationDate?: string;
  status: "none" | "requested" | "received" | "valid" | "expiring" | "expired";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RFI {
  id: string;
  projectId: string;
  question: string;
  sentTo?: string;
  sentAt?: number;
  response?: string;
  respondedAt?: number;
  status: "draft" | "sent" | "answered" | "closed";
  createdAt: number;
  updatedAt: number;
}

// Storage keys
const STORAGE_KEYS = {
  projects: "bidshield_projects",
  checklists: "bidshield_checklists",
  quotes: "bidshield_quotes",
  rfis: "bidshield_rfis",
};

// Helper to safely access localStorage
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== PROJECTS =====

export function getProjects(): Project[] {
  return getStorage<Project[]>(STORAGE_KEYS.projects, []);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function createProject(data: Omit<Project, "id" | "status" | "createdAt" | "updatedAt">): Project {
  const projects = getProjects();
  const now = Date.now();
  const project: Project = {
    id: `proj_${now}`,
    status: "setup",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  projects.push(project);
  setStorage(STORAGE_KEYS.projects, projects);

  // Initialize checklist for this project
  initializeChecklist(project.id);

  return project;
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now(),
  };
  setStorage(STORAGE_KEYS.projects, projects);
  return projects[index];
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  setStorage(STORAGE_KEYS.projects, projects);

  // Also delete checklist
  const checklists = getStorage<Record<string, ChecklistItem[]>>(STORAGE_KEYS.checklists, {});
  delete checklists[id];
  setStorage(STORAGE_KEYS.checklists, checklists);

  // Delete RFIs
  const rfis = getRFIs().filter((r) => r.projectId !== id);
  setStorage(STORAGE_KEYS.rfis, rfis);
}

// ===== CHECKLISTS =====

function initializeChecklist(projectId: string): void {
  const checklists = getStorage<Record<string, ChecklistItem[]>>(STORAGE_KEYS.checklists, {});
  const items: ChecklistItem[] = [];

  for (const [phaseKey, phase] of Object.entries(masterChecklist)) {
    for (const item of phase.items) {
      items.push({
        phaseKey,
        itemId: item.id,
        status: "pending",
      });
    }
  }

  checklists[projectId] = items;
  setStorage(STORAGE_KEYS.checklists, checklists);
}

export function getChecklist(projectId: string): ChecklistItem[] {
  const checklists = getStorage<Record<string, ChecklistItem[]>>(STORAGE_KEYS.checklists, {});
  return checklists[projectId] || [];
}

export function updateChecklistItem(
  projectId: string,
  phaseKey: string,
  itemId: string,
  status: ChecklistItem["status"],
  notes?: string
): void {
  const checklists = getStorage<Record<string, ChecklistItem[]>>(STORAGE_KEYS.checklists, {});
  const items = checklists[projectId] || [];

  const index = items.findIndex((i) => i.phaseKey === phaseKey && i.itemId === itemId);
  if (index !== -1) {
    items[index] = { ...items[index], status, notes };
    checklists[projectId] = items;
    setStorage(STORAGE_KEYS.checklists, checklists);
  }

  // Update project status
  const project = getProject(projectId);
  if (project && project.status === "setup") {
    const doneCount = items.filter((i) => i.status === "done" || i.status === "na").length;
    if (doneCount > 0) {
      updateProject(projectId, { status: "in_progress" });
    }
  }
}

export function getChecklistProgress(projectId: string): number {
  const items = getChecklist(projectId);
  if (items.length === 0) return 0;
  const doneCount = items.filter((i) => i.status === "done" || i.status === "na").length;
  return Math.round((doneCount / items.length) * 100);
}

export function getPhaseProgress(projectId: string, phaseKey: string): number {
  const items = getChecklist(projectId).filter((i) => i.phaseKey === phaseKey);
  if (items.length === 0) return 0;
  const doneCount = items.filter((i) => i.status === "done" || i.status === "na").length;
  return Math.round((doneCount / items.length) * 100);
}

// ===== QUOTES =====

export function getQuotes(projectId?: string): Quote[] {
  const quotes = getStorage<Quote[]>(STORAGE_KEYS.quotes, []);
  if (projectId) {
    return quotes.filter((q) => q.projectId === projectId);
  }
  return quotes;
}

export function createQuote(data: Omit<Quote, "id" | "status" | "createdAt" | "updatedAt">): Quote {
  const quotes = getQuotes();
  const now = Date.now();
  const quote: Quote = {
    id: `quote_${now}`,
    status: "none",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  quotes.push(quote);
  setStorage(STORAGE_KEYS.quotes, quotes);
  return quote;
}

export function updateQuote(id: string, updates: Partial<Quote>): Quote | undefined {
  const quotes = getQuotes();
  const index = quotes.findIndex((q) => q.id === id);
  if (index === -1) return undefined;

  quotes[index] = {
    ...quotes[index],
    ...updates,
    updatedAt: Date.now(),
  };
  setStorage(STORAGE_KEYS.quotes, quotes);
  return quotes[index];
}

export function deleteQuote(id: string): void {
  const quotes = getQuotes().filter((q) => q.id !== id);
  setStorage(STORAGE_KEYS.quotes, quotes);
}

// ===== RFIs =====

export function getRFIs(projectId?: string): RFI[] {
  const rfis = getStorage<RFI[]>(STORAGE_KEYS.rfis, []);
  if (projectId) {
    return rfis.filter((r) => r.projectId === projectId);
  }
  return rfis;
}

export function createRFI(data: Omit<RFI, "id" | "status" | "createdAt" | "updatedAt">): RFI {
  const rfis = getRFIs();
  const now = Date.now();
  const rfi: RFI = {
    id: `rfi_${now}`,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  rfis.push(rfi);
  setStorage(STORAGE_KEYS.rfis, rfis);
  return rfi;
}

export function updateRFI(id: string, updates: Partial<RFI>): RFI | undefined {
  const rfis = getRFIs();
  const index = rfis.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  rfis[index] = {
    ...rfis[index],
    ...updates,
    updatedAt: Date.now(),
  };
  setStorage(STORAGE_KEYS.rfis, rfis);
  return rfis[index];
}

// ===== STATS =====

export function getStats() {
  const projects = getProjects();
  const quotes = getQuotes();
  const rfis = getRFIs();

  const activeProjects = projects.filter(
    (p) => p.status === "setup" || p.status === "in_progress"
  );

  const expiringQuotes = quotes.filter((q) => {
    if (!q.expirationDate) return false;
    const expDate = new Date(q.expirationDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
  });

  const openRFIs = rfis.filter((r) => r.status === "sent");

  const pipelineValue = activeProjects.reduce(
    (sum, p) => sum + (p.totalBidAmount || 0),
    0
  );

  // Win/Loss stats
  const wonProjects = projects.filter((p) => p.status === "won");
  const lostProjects = projects.filter((p) => p.status === "lost");
  const decidedProjects = wonProjects.length + lostProjects.length;
  const winRate = decidedProjects > 0 ? Math.round((wonProjects.length / decidedProjects) * 100) : 0;
  const wonValue = wonProjects.reduce((sum, p) => sum + (p.totalBidAmount || 0), 0);

  return {
    activeProjects: activeProjects.length,
    expiringQuotes: expiringQuotes.length,
    openRFIs: openRFIs.length,
    pipelineValue,
    wonProjects: wonProjects.length,
    lostProjects: lostProjects.length,
    winRate,
    wonValue,
  };
}
