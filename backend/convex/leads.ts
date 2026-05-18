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
