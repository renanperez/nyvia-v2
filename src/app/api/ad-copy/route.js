// src/app/api/ad-copy/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const adCopyModule = () => import("../../../ai-agents/adCopyAgent/index.js");

function envelope({ service, endpoint, env, ok, http, data = null, error = null, requestId, startedAt }) {
  return {
    version: "1",
    service,
    endpoint,
    requestId,
    ts: new Date().toISOString(),
    env,
    ok,
    http,
    duration_ms: startedAt ? Math.max(0, Date.now() - startedAt) : undefined,
    data,
    error,
  };
}

export async function POST(req) {
  const startedAt = Date.now();
  const service = "ad-copy";
  const endpoint = "/api/ad-copy";
  const requestId = `req-${startedAt}-${Math.random().toString(36).slice(2)}`;
  const mode = (NYVIA_MOCK_MODE || "auto").toLowerCase();
  const env = { mode };

  // (1) Content-Type estrito
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      envelope({
        service,
        endpoint,
        env,
        ok: false,
        http: 415,
        requestId,
        startedAt,
        error: { code: "UNSUPPORTED_MEDIA_TYPE", msg: "Expected application/json", details: ct },
      }),
      { status: 415 }
    );
  }

  // (2) Parse seguro do body
  let input;
  try {
    input = await req.json();
  } catch (err) {
    return NextResponse.json(
      envelope({
        service,
        endpoint,
        env,
        ok: false,
        http: 400,
        requestId,
        startedAt,
        error: { code: "BAD_JSON", msg: "Invalid JSON body", details: err.message },
      }),
      { status: 400 }
    );
  }

  // (3) Chamada ao agente (sem re-parse da saída)
  try {
    const mod = await adCopyModule();
    const run = mod.default?.run || mod.run || mod?.default?.default?.run;
    if (typeof run !== "function") throw new Error("Agent run() not found");

    const result = await run(input, { requestId, agentName: "adCopyAgent" });

    return NextResponse.json(
      envelope({ service, endpoint, env, ok: true, http: 200, data: result, requestId, startedAt }),
      { status: 200 }
    );
  } catch (err) {
    console.error("[ad-copy] route error stack:", err?.stack || err);
    return NextResponse.json(
      envelope({
        service,
        endpoint,
        env,
        ok: false,
        http: 500,
        requestId,
        startedAt,
        error: { code: "UNHANDLED", msg: "Ad copy failed", details: String(err?.message || err) },
      }),
      { status: 500 }
    );
  }
}
