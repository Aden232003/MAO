import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const add = internalMutation({
  args: {
    email: v.string(),
    phone: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workshopLeads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        phone: args.phone || existing.phone,
        source: args.source,
      });
      return existing._id;
    }
    return await ctx.db.insert("workshopLeads", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("workshopLeads")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});

import { internalMutation as removeMutation } from "./_generated/server";

export const removeByEmail = removeMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const row = await ctx.db
      .query("workshopLeads")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .first();
    if (!row) return { deleted: 0 };
    await ctx.db.delete(row._id);
    return { deleted: 1, id: row._id };
  },
});
