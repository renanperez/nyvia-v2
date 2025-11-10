// src/app/api/healthz/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDb } from "../../../server/db/client.js";
import { APP_ENV, NODE_ENV } from "../../../config/env.js" ;// importando variáveis de ambiente necessárias

export async function GET() {
  const appEnv = APP_ENV ;
  const nodeEnv = NODE_ENV ;

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    
    return NextResponse.json({ ok: true, db: "up", appEnv, nodeEnv });
  } catch (e) {
    return NextResponse.json(
      { ok: false, db: "down", error: e.message, appEnv, nodeEnv },
      { status: 500 }
    );
  }
}
