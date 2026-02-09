/* Theme: wrap app in <ThemeProvider attribute="class" defaultTheme="dark"> (e.g. in layout.tsx) and add suppressHydrationWarning to <html> */
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { WikiArticleView } from "@/components/wiki-article-view"
import { fetchWikipediaArticle } from "@/lib/wikipedia"

interface WikiPageProps {
  params: Promise<{ title: string }>
}

export async function generateMetadata({
  params,
}: WikiPageProps): Promise<Metadata> {
  const { title } = await params
  const slug = decodeURIComponent(title).replace(/_/g, " ")
  const article = await fetchWikipediaArticle(slug)
  if (!article) return { title: "Article not found" }
  return {
    title: `${article.title} - Wikipedia`,
    description: article.extract?.slice(0, 160),
  }
}

export default async function WikiArticlePage({ params }: WikiPageProps) {
  const { title } = await params
  const slug = decodeURIComponent(title).replace(/_/g, " ")

  const article = await fetchWikipediaArticle(slug)
  if (!article) notFound()

  return <WikiArticleView article={article} />
}
