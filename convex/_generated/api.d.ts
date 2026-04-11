/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bidshield from "../bidshield.js";
import type * as bidshield__helpers from "../bidshield/_helpers.js";
import type * as bidshield_addenda from "../bidshield/addenda.js";
import type * as bidshield_alternates from "../bidshield/alternates.js";
import type * as bidshield_bidQuals from "../bidshield/bidQuals.js";
import type * as bidshield_checklist from "../bidshield/checklist.js";
import type * as bidshield_datasheets from "../bidshield/datasheets.js";
import type * as bidshield_decisions from "../bidshield/decisions.js";
import type * as bidshield_gcBidForms from "../bidshield/gcBidForms.js";
import type * as bidshield_gcItems from "../bidshield/gcItems.js";
import type * as bidshield_labor from "../bidshield/labor.js";
import type * as bidshield_laborRates from "../bidshield/laborRates.js";
import type * as bidshield_materials from "../bidshield/materials.js";
import type * as bidshield_preBidMeetings from "../bidshield/preBidMeetings.js";
import type * as bidshield_projects from "../bidshield/projects.js";
import type * as bidshield_quotes from "../bidshield/quotes.js";
import type * as bidshield_rfis from "../bidshield/rfis.js";
import type * as bidshield_scope from "../bidshield/scope.js";
import type * as bidshield_stats from "../bidshield/stats.js";
import type * as bidshield_submissions from "../bidshield/submissions.js";
import type * as bidshield_takeoff from "../bidshield/takeoff.js";
import type * as bidshield_vendors from "../bidshield/vendors.js";
import type * as bidshieldDefaults from "../bidshieldDefaults.js";
import type * as checklistTemplates from "../checklistTemplates.js";
import type * as email from "../email.js";
import type * as gumroad from "../gumroad.js";
import type * as leads from "../leads.js";
import type * as rateLimits from "../rateLimits.js";
import type * as subscribers from "../subscribers.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bidshield: typeof bidshield;
  "bidshield/_helpers": typeof bidshield__helpers;
  "bidshield/addenda": typeof bidshield_addenda;
  "bidshield/alternates": typeof bidshield_alternates;
  "bidshield/bidQuals": typeof bidshield_bidQuals;
  "bidshield/checklist": typeof bidshield_checklist;
  "bidshield/datasheets": typeof bidshield_datasheets;
  "bidshield/decisions": typeof bidshield_decisions;
  "bidshield/gcBidForms": typeof bidshield_gcBidForms;
  "bidshield/gcItems": typeof bidshield_gcItems;
  "bidshield/labor": typeof bidshield_labor;
  "bidshield/laborRates": typeof bidshield_laborRates;
  "bidshield/materials": typeof bidshield_materials;
  "bidshield/preBidMeetings": typeof bidshield_preBidMeetings;
  "bidshield/projects": typeof bidshield_projects;
  "bidshield/quotes": typeof bidshield_quotes;
  "bidshield/rfis": typeof bidshield_rfis;
  "bidshield/scope": typeof bidshield_scope;
  "bidshield/stats": typeof bidshield_stats;
  "bidshield/submissions": typeof bidshield_submissions;
  "bidshield/takeoff": typeof bidshield_takeoff;
  "bidshield/vendors": typeof bidshield_vendors;
  bidshieldDefaults: typeof bidshieldDefaults;
  checklistTemplates: typeof checklistTemplates;
  email: typeof email;
  gumroad: typeof gumroad;
  leads: typeof leads;
  rateLimits: typeof rateLimits;
  subscribers: typeof subscribers;
  users: typeof users;
  utils: typeof utils;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
