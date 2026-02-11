import type { Metadata } from "next";
import Link from "next/link";
import { Shuffle, BookOpen } from "lucide-react";
import { WikiSearch } from "@/components/wiki-search";
import { WikiAuth } from "@/components/wiki-auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Openpedia Client",
  description: "A Wikipedia client with a clean, modern interface for browsing Wikipedia content",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="shrink-0 font-sans text-xl font-bold tracking-tight text-foreground"
          >
            Openpedia <span className="text-muted-foreground">Client</span>
          </Link>
          <WikiAuth />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-20 sm:py-32">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-3 font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Search Openpedia
          </h1>
          <p className="mb-10 max-w-md text-muted-foreground">
            A clean, modern interface for browsing Wikipedia. Start typing to
            search millions of articles.
          </p>

          <div className="w-full max-w-lg">
            <WikiSearch />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/wiki/Main_Page" className="gap-2">
                <BookOpen className="size-4" />
                Main page
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/random" className="gap-2">
                <Shuffle className="size-4" />
                Random article
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/about">About</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
