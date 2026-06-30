import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

// MAO beta application (main landing/sales page apply form).
// Upserts by email so a re-submit updates the existing row instead of duplicating.
export const add = internalMutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    instagram: v.optional(v.string()),
    phone: v.optional(v.string()),
    current_status: v.optional(v.string()),
    income_range: v.optional(v.string()),
    pain_point: v.optional(v.string()),
    why_join: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
      return existing._id;
    }
    return await ctx.db.insert("applications", { ...args, createdAt: Date.now() });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("applications").withIndex("by_createdAt").order("desc").take(200),
});

// Doc-vault email unlock (same page, email-gated download).
export const addVault = internalMutation({
  args: { email: v.string(), source: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vaultUnlocks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("vaultUnlocks", { ...args, createdAt: Date.now() });
  },
});

export const listVault = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("vaultUnlocks").withIndex("by_createdAt").order("desc").take(200),
});
