import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - Openpedia Client",
  description: "About Openpedia Client, a Wikipedia client",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4">
          <Link
            href="/"
            className="shrink-0 font-sans text-xl font-bold tracking-tight text-foreground"
          >
            Openpedia <span className="text-muted-foreground">Client</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 font-serif text-2xl font-normal text-foreground">
          About Openpedia Client
        </h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            Openpedia Client is a Wikipedia client that provides a clean,
            modern interface for browsing Wikipedia content. It fetches article
            data from the Wikipedia API and displays it in a readable format.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Content is sourced from Wikipedia and is available under the
            Creative Commons Attribution-ShareAlike License.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            <Link
              href="/"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Return to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
