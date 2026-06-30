import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workshopLeads: defineTable({
    email: v.string(),
    phone: v.string(),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  // MAO main landing/sales page — beta application form
  applications: defineTable({
    full_name: v.string(),
    email: v.string(),
    instagram: v.optional(v.string()),
    phone: v.optional(v.string()),
    current_status: v.optional(v.string()),
    income_range: v.optional(v.string()),
    pain_point: v.optional(v.string()),
    why_join: v.optional(v.string()),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  // MAO doc-vault email unlocks (same landing page)
  vaultUnlocks: defineTable({
    email: v.string(),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),
});
