/* Theme: wrap app in <ThemeProvider attribute="class" defaultTheme="dark"> (e.g. in layout.tsx) and add suppressHydrationWarning to <html> */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WikiArticleView } from "@/components/wiki-article-view";
import { fetchWikipediaArticle } from "@/lib/wikipedia";

interface WikiPageProps {
  params: Promise<{ title: string }>;
  searchParams: Promise<{ lang?: string }>;
}

const DEFAULT_LANG = "en";

export async function generateMetadata({
  params,
  searchParams,
}: WikiPageProps): Promise<Metadata> {
  const { title } = await params;
  const { lang } = await searchParams;
  const slug = decodeURIComponent(title).replace(/_/g, " ");
  const article = await fetchWikipediaArticle(slug, lang ?? DEFAULT_LANG);
  if (!article) return { title: "Article not found" };
  return {
    title: `${article.title} - Openpedia Client`,
    description: article.extract?.slice(0, 160),
  };
}

export default async function WikiArticlePage({
  params,
  searchParams,
}: WikiPageProps) {
  const { title } = await params;
  const { lang } = await searchParams;
  const slug = decodeURIComponent(title).replace(/_/g, " ");
  const langCode = lang ?? DEFAULT_LANG;

  const article = await fetchWikipediaArticle(slug, langCode);
  if (!article) notFound();

  return (
    <WikiArticleView article={article} lang={langCode} titleParam={title} />
  );
}
