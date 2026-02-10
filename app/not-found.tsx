import Link from "next/link";
import { WikiSearch } from "@/components/wiki-search";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <FileQuestion className="size-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-normal text-foreground">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The article or page you&apos;re looking for doesn&apos;t exist or
            may have been moved.
          </p>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">
              Search for an article
            </p>
            <WikiSearch />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/wiki/Main_Page">Main page</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/random">Random article</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
