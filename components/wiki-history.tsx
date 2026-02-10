"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { GitCompare, ChevronRightIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { WikipediaRevision } from "@/lib/wikipedia";

const PAGE_SIZE = 20;

interface WikiHistoryProps {
  title: string;
  lang?: string;
}

export function WikiHistory({ title, lang = "en" }: WikiHistoryProps) {
  const [revisions, setRevisions] = useState<WikipediaRevision[]>([]);
  const [continueKey, setContinueKey] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingNextPage, setPendingNextPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fromRev, setFromRev] = useState<WikipediaRevision | null>(null);
  const [toRev, setToRev] = useState<WikipediaRevision | null>(null);

  const titleSlug = encodeURIComponent(title.replace(/\s+/g, "_"));
  const compareBase = `/wiki/${titleSlug}/compare`;

  function getCompareUrl(from: number, to: number): string {
    const params = new URLSearchParams({ from: String(from), to: String(to) });
    if (lang !== "en") params.set("lang", lang);
    return `${compareBase}?${params}`;
  }

  const loadRevisions = useCallback(
    async (append = false) => {
      if (append) setLoadMoreLoading(true);
      else setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          title,
          limit: String(PAGE_SIZE),
          lang,
        });
        if (append && continueKey) params.set("rvcontinue", continueKey);
        const res = await fetch(`/api/wiki/revisions?${params}`);
        if (!res.ok) throw new Error("Failed to load revisions");

        const data = (await res.json()) as {
          revisions: WikipediaRevision[];
          continue?: string;
        };

        if (append) {
          setRevisions((prev) => [...prev, ...data.revisions]);
        } else {
          setRevisions(data.revisions);
        }
        setContinueKey(data.continue);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        setIsLoading(false);
        setLoadMoreLoading(false);
      }
    },
    [title, continueKey, lang]
  );

  useEffect(() => {
    loadRevisions();
    setCurrentPage(1);
    setPendingNextPage(null);
  }, [title, lang]);

  useEffect(() => {
    if (!loadMoreLoading && pendingNextPage !== null) {
      setCurrentPage(pendingNextPage);
      setPendingNextPage(null);
    }
  }, [loadMoreLoading, pendingNextPage]);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRevisions = revisions.slice(start, start + PAGE_SIZE);
  const hasNextPage =
    revisions.length > start + PAGE_SIZE || continueKey !== undefined;
  const totalLoadedPages = Math.ceil(revisions.length / PAGE_SIZE);
  const displayTotal = Math.max(currentPage, totalLoadedPages);

  const selectAsOld = (r: WikipediaRevision) => {
    setFromRev(r);
    if (toRev?.revid === r.revid) setToRev(null);
  };

  const selectAsNew = (r: WikipediaRevision) => {
    setToRev(r);
    if (fromRev?.revid === r.revid) setFromRev(null);
  };

  const hasSelection = fromRev && toRev && fromRev.revid !== toRev.revid;

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 text-sm text-destructive">
        {error}
        <Button
          variant="link"
          size="sm"
          className="ml-2 h-auto p-0"
          onClick={() => loadRevisions()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No revision history available.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Select Old and New from the list, then compare:
        </span>
        {fromRev && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs">
            Old: {formatDistanceToNow(new Date(fromRev.timestamp), {
              addSuffix: true,
            })}
          </span>
        )}
        {toRev && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs">
            New: {formatDistanceToNow(new Date(toRev.timestamp), {
              addSuffix: true,
            })}
          </span>
        )}
        {hasSelection && (
          <Button size="sm" asChild className="gap-1.5">
            <Link
              href={getCompareUrl(
                fromRev!.revid < toRev!.revid ? fromRev!.revid : toRev!.revid,
                fromRev!.revid < toRev!.revid ? toRev!.revid : fromRev!.revid
              )}
            >
              <GitCompare className="size-4" />
              Compare
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Time</th>
              <th className="px-3 py-2 text-left font-medium">User</th>
              <th className="px-3 py-2 text-left font-medium">Size</th>
              <th className="px-3 py-2 text-left font-medium">Comment</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRevisions.map((r) => (
              <tr
                key={r.revid}
                className="border-b border-border/50 hover:bg-muted/30"
              >
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDistanceToNow(new Date(r.timestamp), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-3 py-2">{r.user}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {r.size.toLocaleString()} B
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                  {r.comment || "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    {pageRevisions.indexOf(r) < pageRevisions.length - 1 && (
                      <Button variant="ghost" size="xs" asChild className="gap-0.5">
                        <Link
                          href={getCompareUrl(
                            pageRevisions[pageRevisions.indexOf(r) + 1].revid,
                            r.revid
                          )}
                        >
                          Compare with previous
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => selectAsOld(r)}
                      className={cn(
                        fromRev?.revid === r.revid &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      Old
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => selectAsNew(r)}
                      className={cn(
                        toRev?.revid === r.revid &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      New
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage((p) => p - 1);
              }}
              className={cn(
                currentPage <= 1 && "pointer-events-none opacity-50"
              )}
              href="#"
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 py-1 text-sm text-muted-foreground">
              Page {currentPage} of {displayTotal}
              {hasNextPage ? "+" : ""}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={async (e) => {
                e.preventDefault();
                if (!hasNextPage || loadMoreLoading) return;
                const targetPage = currentPage + 1;
                const needToLoad =
                  revisions.length < targetPage * PAGE_SIZE && !!continueKey;
                if (needToLoad) {
                  setPendingNextPage(targetPage);
                  await loadRevisions(true);
                } else {
                  setCurrentPage(targetPage);
                }
              }}
              className={cn(
                (!hasNextPage || loadMoreLoading) &&
                  "pointer-events-none opacity-50"
              )}
              href="#"
            >
              {loadMoreLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="hidden sm:inline">Loading</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon className="size-4" />
                </>
              )}
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
