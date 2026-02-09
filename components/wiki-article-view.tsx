"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ChevronDown,
  Menu,
  Sun,
  Moon,
  MoreHorizontal,
  ListOrdered,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { WikipediaArticle } from "@/lib/wikipedia"
import { WikiSearch } from "@/components/wiki-search"

const SIDEBAR_NAV_LINKS = [
  "Main page",
  "Contents",
  "Current events",
  "Random article",
  "About Wikipedia",
  "Contact us",
  "Donate",
]

const SIDEBAR_TOOLS_LINKS = [
  "What links here",
  "Related changes",
  "Upload file",
  "Special pages",
  "Permanent link",
  "Page information",
  "Cite this page",
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="relative"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "dark" ? "Switch to light" : "Switch to dark"}
      </TooltipContent>
    </Tooltip>
  )
}

interface WikiArticleViewProps {
  article: WikipediaArticle
}

export function WikiArticleView({ article }: WikiArticleViewProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <nav className="flex flex-col gap-1 p-4">
                    <div className="mb-4 text-sm font-medium text-muted-foreground">
                      Navigation
                    </div>
                    {SIDEBAR_NAV_LINKS.map((link) => (
                      <Link
                        key={link}
                        href="#"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {link}
                      </Link>
                    ))}
                    <Separator className="my-3" />
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      Tools
                    </div>
                    {SIDEBAR_TOOLS_LINKS.map((link) => (
                      <Link
                        key={link}
                        href="#"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {link}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <Link
              href="/"
              className="shrink-0 font-serif text-xl font-bold tracking-tight text-foreground"
            >
              Wikipedia
            </Link>
            <div className="flex flex-1 items-center justify-end gap-2">
              <div className="hidden w-64 max-w-xs sm:block">
                <WikiSearch />
              </div>
              <ThemeToggle />
              <Link href="#">
                <Button variant="ghost" size="sm" className="text-sm">
                  Create account
                </Button>
              </Link>
              <Link href="#">
                <Button variant="ghost" size="sm" className="text-sm">
                  Log in
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                  <DropdownMenuItem>Contributions</DropdownMenuItem>
                  <DropdownMenuItem>Watchlist</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1500px]">
          <aside className="hidden w-40 shrink-0 border-r border-border py-4 pl-4 pr-2 lg:block">
            <nav className="flex flex-col gap-1 text-sm">
              {SIDEBAR_NAV_LINKS.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {link}
                </Link>
              ))}
              <Separator className="my-3" />
              {article.sections.length > 0 && (
                <>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Contents
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <ul className="mt-1 space-y-0.5 pr-2">
                      {article.sections.map((s) => (
                        <li
                          key={s.id}
                          style={{ paddingLeft: (s.level - 1) * 8 }}
                        >
                          <a
                            href={`#${s.id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator className="my-3" />
                </>
              )}
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tools
              </div>
              {SIDEBAR_TOOLS_LINKS.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {link}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1240px] gap-8">
              <article className="min-w-0 flex-1">
                <h1 className="mb-4 font-serif text-[1.75rem] font-normal leading-tight text-foreground">
                  {article.title}
                </h1>

                <div className="xl:hidden">
                  <Collapsible defaultOpen={false} className="group">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex w-full items-center justify-between gap-2 border border-border py-2 px-3 text-left font-normal"
                      >
                        <span className="flex items-center gap-2">
                          <ListOrdered className="size-4" />
                          Contents
                        </span>
                        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <nav className="mt-0 border border-border border-t-0 p-3">
                        <ul className="space-y-1 text-sm">
                          {article.sections.map((s) => (
                            <li
                              key={s.id}
                              style={{ paddingLeft: (s.level - 1) * 12 }}
                            >
                              <a
                                href={`#${s.id}`}
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {s.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="mt-6 flex gap-8">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div
                      className="wiki-content font-serif text-[0.9375rem] leading-[1.6] [&_.mw-parser-output]:overflow-hidden [&_.mw-parser-output]:mt-0 [&_.mw-parser-output_.hatnote]:italic [&_.mw-parser-output_.hatnote]:text-muted-foreground [&_.mw-parser-output_.hatnote]:mb-4 [&_.mw-parser-output_a]:text-blue-600 [&_.mw-parser-output_a]:hover:underline [&_.mw-parser-output_a]:dark:text-blue-400 [&_.mw-parser-output_h2]:text-xl [&_.mw-parser-output_h2]:font-normal [&_.mw-parser-output_h2]:mt-8 [&_.mw-parser-output_h2]:mb-3 [&_.mw-parser-output_h2]:scroll-mt-20 [&_.mw-parser-output_h3]:text-lg [&_.mw-parser-output_h3]:font-normal [&_.mw-parser-output_h3]:mt-6 [&_.mw-parser-output_h3]:mb-2 [&_.mw-parser-output_p]:mb-3 [&_.mw-parser-output_ul]:mb-3 [&_.mw-parser-output_ul]:pl-6 [&_.mw-parser-output_ol]:mb-3 [&_.mw-parser-output_ol]:pl-6 [&_.mw-parser-output_table]:border [&_.mw-parser-output_table]:border-border [&_.mw-parser-output_th]:border [&_.mw-parser-output_th]:border-border [&_.mw-parser-output_th]:bg-muted/30 [&_.mw-parser-output_th]:p-2 [&_.mw-parser-output_td]:border [&_.mw-parser-output_td]:border-border [&_.mw-parser-output_td]:p-2 [&_.mw-parser-output_.infobox]:float-right [&_.mw-parser-output_.infobox]:ml-4 [&_.mw-parser-output_.infobox]:mb-4 [&_.mw-parser-output_.infobox]:border [&_.mw-parser-output_.infobox]:border-border [&_.mw-parser-output_.infobox]:bg-muted/30 [&_.mw-parser-output_.infobox]:max-w-[320px] [&_.mw-parser-output_.sidebar]:!bg-muted/30 [&_.mw-parser-output_.sidebar]:!border-border [&_.mw-parser-output_.sidebar]:text-foreground [&_.mw-parser-output_.sidebar_th]:!bg-muted/50 [&_.mw-parser-output_.sidebar_th]:!border-border [&_.mw-parser-output_.sidebar_td]:!border-border [&_.mw-parser-output_.sidebar_a]:text-blue-600 [&_.mw-parser-output_.sidebar_a]:hover:underline [&_.mw-parser-output_.sidebar_a]:dark:text-blue-400 [&_.mw-parser-output_.sidebar-list-title]:!bg-muted/50 [&_.mw-parser-output_.sidebar-list-title]:!text-foreground [&_.mw-parser-output_figure]:float-right [&_.mw-parser-output_figure]:ml-4 [&_.mw-parser-output_figure]:mb-4 [&_.mw-parser-output_.thumb]:float-right [&_.mw-parser-output_.thumb]:ml-4 [&_.mw-parser-output_.thumb]:mb-4 [&_.mw-parser-output_.tleft]:float-left [&_.mw-parser-output_.tleft]:mr-4 [&_.mw-parser-output_.tleft]:mb-4 [&_.mw-parser-output_.navbox]:!bg-muted/30 [&_.mw-parser-output_.navbox]:!border [&_.mw-parser-output_.navbox]:!border-border [&_.mw-parser-output_.navbox]:text-foreground [&_.mw-parser-output_.navbox_th]:!bg-muted/50 [&_.mw-parser-output_.navbox_th]:!border-border [&_.mw-parser-output_.navbox_td]:!border-border [&_.mw-parser-output_.navbox_a]:text-blue-600 [&_.mw-parser-output_.navbox_a]:hover:underline [&_.mw-parser-output_.navbox_a]:dark:text-blue-400 [&_.mw-parser-output_.navbox-group]:!bg-muted/50 [&_.mw-parser-output_.navbox-group]:!text-foreground [&_.mw-parser-output_.navbox-abovebelow]:!bg-muted/50 [&_.mw-parser-output_.navbox-abovebelow]:!text-foreground [&_.mw-parser-output_.navbox-list]:!bg-muted/30 [&_.mw-parser-output_.navbox-list]:!text-foreground [&_.mw-parser-output_.navbox-list-with-group]:!bg-muted/30 [&_.mw-parser-output_.navbox-list-with-group]:!text-foreground [&_.mw-parser-output_.navbox-odd]:!bg-muted/30 [&_.mw-parser-output_.navbox-odd]:!text-foreground [&_.mw-parser-output_.navbox-even]:!bg-muted/30 [&_.mw-parser-output_.navbox-even]:!text-foreground [&_.mw-parser-output_.navbox-inner]:!bg-muted/30 [&_.mw-parser-output_.navbox-inner]:!text-foreground [&_.mw-parser-output_img]:max-w-full [&_.mw-parser-output_img]:h-auto"
                      dangerouslySetInnerHTML={{ __html: article.html }}
                    />

                    {article.categories.length > 0 && (
                      <section className="mt-6 border-t border-border pt-4">
                        <div className="text-xs text-muted-foreground">
                          Categories:{" "}
                          {article.categories.map((cat, i) => (
                            <span key={i}>
                              <Link
                                href={`/wiki/Category:${encodeURIComponent(cat)}`}
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {cat}
                              </Link>
                              {i < article.categories.length - 1 ? " · " : ""}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                </div>
              </article>
            </div>
          </main>
        </div>

        <footer className="mt-12 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
            <div className="grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h4 className="mb-2 font-semibold text-foreground">
                  Wikipedia
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      About Wikipedia
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Disclaimers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Contact Wikipedia
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Community</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Help
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Learn to edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Community portal
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Resources</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Recent changes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Upload file
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-foreground">
                  Print/export
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Download as PDF
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Printable version
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <Link
                href="#"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Wikipedia
              </Link>
              <span>·</span>
              <Link
                href="#"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                The Free Encyclopedia
              </Link>
              <span>·</span>
              <span>
                Content is available under CC BY-SA 4.0 unless otherwise noted.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
