import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

http.route({
  path: "/lead",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/lead",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const source = String(body.source || "workshop");

      if (!email.includes("@") || email.length < 5) {
        return new Response(JSON.stringify({ error: "invalid email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await ctx.runMutation(internal.leads.add, { email, phone, source });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

// ── MAO landing page: beta application form ──
http.route({
  path: "/apply",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
  path: "/apply",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase();
      const full_name = String(body.full_name || "").trim();

      if (!email.includes("@") || email.length < 5) {
        return new Response(JSON.stringify({ error: "invalid email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await ctx.runMutation(internal.applications.add, {
        full_name,
        email,
        instagram: String(body.instagram || "").trim(),
        phone: String(body.phone || "").trim(),
        current_status: String(body.current_status || "").trim(),
        income_range: String(body.income_range || "").trim(),
        pain_point: String(body.pain_point || "").trim(),
        why_join: String(body.why_join || "").trim(),
        source: String(body.source || "page1_apply"),
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

// ── MAO landing page: doc-vault email unlock ──
http.route({
  path: "/vault",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
  path: "/vault",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase();
      if (!email.includes("@") || email.length < 5) {
        return new Response(JSON.stringify({ error: "invalid email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await ctx.runMutation(internal.applications.addVault, {
        email,
        source: String(body.source || "vault"),
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
