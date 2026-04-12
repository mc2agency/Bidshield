// ===== Re-export all modules to maintain backward-compatible API paths =====
// All exports maintain their original API endpoints: bidshield:functionName

// Projects
export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./bidshield/projects";

// Checklist
export {
  getChecklist,
  updateChecklistItem,
  getChecklistProgress,
} from "./bidshield/checklist";

// Quotes
export {
  getQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  getQuotesWithProjects,
  importQuoteToProject,
  parseLineItems,
  upsertLineItemsToDatasheets,
} from "./bidshield/quotes";

// RFIs
export {
  getRFIs,
  createRFI,
  updateRFI,
  deleteRFI,
} from "./bidshield/rfis";

// Stats
export {
  getStats,
  getComparisonData,
} from "./bidshield/stats";

// Labor Rates
export {
  getLaborRates,
  createLaborRate,
  updateLaborRate,
  deleteLaborRate,
} from "./bidshield/laborRates";

// Addenda
export {
  getAddenda,
  createAddendum,
  updateAddendum,
  deleteAddendum,
  acknowledgeNoAddenda,
} from "./bidshield/addenda";

// Takeoff
export {
  getTakeoffSections,
  createTakeoffSection,
  updateTakeoffSection,
  deleteTakeoffSection,
  getTakeoffLineItems,
  initTakeoffLineItems,
  updateTakeoffLineItem,
  createTakeoffLineItem,
  deleteTakeoffLineItem,
} from "./bidshield/takeoff";

// Materials
export {
  getProjectMaterials,
  addProjectMaterial,
  updateProjectMaterial,
  deleteProjectMaterial,
  initProjectMaterials,
  clearProjectMaterials,
  bulkSaveMaterialsFromExtraction,
  updateMaterialCoverageRate,
  fixMaterialCategories,
  getUserMaterialPrices,
  upsertUserMaterialPrice,
  syncTakeoffToMaterials,
} from "./bidshield/materials";

// Scope
export {
  getScopeItems,
  initScopeItems,
  updateScopeItem,
  getScopeClarifications,
  addScopeClarification,
  deleteScopeClarification,
  addCustomScopeItem,
  deleteScopeItem,
  bulkUpdateScopeStatus,
} from "./bidshield/scope";

// Bid Qualifications
export {
  getBidQuals,
  upsertBidQuals,
} from "./bidshield/bidQuals";

// Decisions
export {
  getDecisions,
  addDecision,
  deleteDecision,
} from "./bidshield/decisions";

// General Conditions
export {
  getGCItems,
  seedGCItems,
  upsertGCItem,
  deleteGCItem,
} from "./bidshield/gcItems";

// Datasheets
export {
  getDatasheets,
  addDatasheet,
  updateDatasheet,
  deleteDatasheet,
  generatePdfUploadUrl,
  getMonthlyExtractionCount,
  backfillPriceLibraryFromQuotes,
} from "./bidshield/datasheets";

// Labor Verification
export {
  saveLaborAnalysis,
  getLaborTasks,
  getLaborAnalysis,
  getLaborTotal,
  getUnverifiedLaborCount,
  updateLaborTask,
  toggleLaborTaskVerified,
  clearLaborTasks,
} from "./bidshield/labor";

// Vendors
export {
  getVendors,
  getVendorsByCategory,
  getVendorWithQuoteHistory,
  createVendor,
  updateVendor,
  deleteVendor,
  linkQuoteToVendor,
} from "./bidshield/vendors";

// GC Bid Forms
export {
  saveGcBidForm,
  reanalyzeGcBidForm,
  updateGcBidFormItem,
  updateGcBidFormLabel,
  deleteGcBidFormDocument,
  getGcBidFormDocuments,
  getGcBidFormItems,
  getUnconfirmedGcBidFormCount,
} from "./bidshield/gcBidForms";

// Submissions
export {
  getSubmissions,
  addSubmission,
  deleteSubmission,
} from "./bidshield/submissions";

// Pre-Bid Meetings
export {
  getPreBidMeetings,
  addPreBidMeeting,
  updatePreBidMeeting,
  deletePreBidMeeting,
} from "./bidshield/preBidMeetings";

// Alternates
export {
  getAlternates,
  addAlternate,
  updateAlternate,
  deleteAlternate,
} from "./bidshield/alternates";

// Validator Batch (H-6)
export {
  getValidatorData,
} from "./bidshield/validatorBatch";

// Re-export helpers for internal use
export {
  roundCurrency,
  validateAuth,
  assertProjectOwnership,
  assertRecordOwnership,
  requirePro,
} from "./bidshield/_helpers";
