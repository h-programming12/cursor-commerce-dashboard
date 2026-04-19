import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type HealthBody = {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  supabase?: "ok" | "skipped" | "error";
};

function getVersion(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha && sha.length >= 7) {
    return sha.slice(0, 7);
  }
  return "unknown";
}

async function checkSupabaseAuthHealth(): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!baseUrl) {
    return true;
  }

  const normalized = baseUrl.replace(/\/$/, "");
  const healthUrl = `${normalized}/auth/v1/health`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = getVersion();

  const hasSupabaseUrl = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  );

  if (!hasSupabaseUrl) {
    const body: HealthBody = {
      status: "ok",
      timestamp,
      version,
      supabase: "skipped",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const supabaseOk = await checkSupabaseAuthHealth();

  if (!supabaseOk) {
    const body: HealthBody = {
      status: "degraded",
      timestamp,
      version,
      supabase: "error",
    };
    return NextResponse.json(body, { status: 503 });
  }

  const body: HealthBody = {
    status: "ok",
    timestamp,
    version,
    supabase: "ok",
  };
  return NextResponse.json(body, { status: 200 });
}
