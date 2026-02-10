import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchWikipediaCompare } from "@/lib/wikipedia";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComparePageProps {
  params: Promise<{ title: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ComparePageProps): Promise<Metadata> {
  const { title } = await params;
  const { from, to } = await searchParams;
  const slug = decodeURIComponent(title).replace(/_/g, " ");
  return {
    title: `Compare revisions: ${slug} - Openpedia Client`,
    description: from && to ? `Comparing revisions ${from} and ${to}` : undefined,
  };
}

export default async function WikiComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { title } = await params;
  const { from, to } = await searchParams;
  const slug = decodeURIComponent(title).replace(/_/g, " ");

  const fromRevId = from ? parseInt(from, 10) : NaN;
  const toRevId = to ? parseInt(to, 10) : NaN;

  if (!Number.isFinite(fromRevId) || !Number.isFinite(toRevId)) {
    notFound();
  }

  const result = await fetchWikipediaCompare(fromRevId, toRevId);
  if (!result) notFound();

  const wikiPath = `/wiki/${encodeURIComponent(title)}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4">
          <Link href={wikiPath}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="size-4" />
              Back to article
            </Button>
          </Link>
          <Link
            href="/"
            className="shrink-0 font-sans text-xl font-bold tracking-tight text-foreground"
          >
            Openpedia <span className="text-muted-foreground">Client</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-xl font-normal">
            Comparing revisions: {slug}
          </h1>
          <Link href={wikiPath}>
            <Button variant="outline" size="sm">
              View history
            </Button>
          </Link>
        </div>

        <div className="space-y-4 rounded border border-border bg-muted/20 p-4">
          {(result.fromUser || result.toUser) && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {result.fromUser && (
                <span>
                  From: {result.fromUser}
                  {result.fromTimestamp &&
                    ` (${formatDistanceToNow(new Date(result.fromTimestamp), {
                      addSuffix: true,
                    })})`}
                </span>
              )}
              {result.toUser && (
                <span>
                  To: {result.toUser}
                  {result.toTimestamp &&
                    ` (${formatDistanceToNow(new Date(result.toTimestamp), {
                      addSuffix: true,
                    })})`}
                </span>
              )}
            </div>
          )}

          {result.diffHtml ? (
            result.diffHtml.includes("<tr") ? (
              <div
                className="wiki-diff overflow-x-auto rounded border border-border bg-background text-sm [&_.diff-context]:bg-muted/30 [&_.diff-addedline]:bg-green-500/15 [&_.diff-addedline_.diffchange]:bg-green-500/30 [&_.diff-deletedline]:bg-red-500/15 [&_.diff-deletedline_.diffchange]:bg-red-500/30 [&_.diff-addedline]:border-l-2 [&_.diff-addedline]:border-l-green-600 [&_.diff-deletedline]:border-l-2 [&_.diff-deletedline]:border-l-red-600 [&_td]:p-2 [&_td]:align-top [&_th]:p-2 [&_th]:text-left [&_th]:font-medium"
                dangerouslySetInnerHTML={{
                  __html: `<table class="diff"><colgroup><col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup><tbody>${result.diffHtml}</tbody></table>`,
                }}
              />
            ) : (
              <pre className="wiki-diff overflow-x-auto whitespace-pre-wrap rounded border border-border bg-background p-4 font-mono text-xs [word-break:break-word]">
                {result.diffHtml}
              </pre>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              No changes detected between these revisions.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
