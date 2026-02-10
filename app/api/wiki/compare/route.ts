import { NextResponse } from "next/server";
import { fetchWikipediaCompare } from "@/lib/wikipedia";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const lang = searchParams.get("lang") ?? "en";

  const fromRevId = from ? parseInt(from, 10) : NaN;
  const toRevId = to ? parseInt(to, 10) : NaN;

  if (!Number.isFinite(fromRevId) || !Number.isFinite(toRevId)) {
    return NextResponse.json(
      { error: "Missing or invalid from/to revision IDs" },
      { status: 400 }
    );
  }

  const result = await fetchWikipediaCompare(fromRevId, toRevId, lang);
  if (!result) {
    return NextResponse.json(
      { error: "Could not compare revisions" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
