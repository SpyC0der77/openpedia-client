import { NextResponse } from "next/server";
import { fetchWikipediaRevisions } from "@/lib/wikipedia";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const limit = searchParams.get("limit");
  const rvcontinue = searchParams.get("rvcontinue");

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Missing title parameter" },
      { status: 400 }
    );
  }

  const { revisions, continue: cont } = await fetchWikipediaRevisions(
    title,
    limit ? parseInt(limit, 10) : 50,
    rvcontinue ?? undefined
  );

  return NextResponse.json({ revisions, continue: cont });
}
