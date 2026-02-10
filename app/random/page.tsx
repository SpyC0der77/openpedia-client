import { redirect } from "next/navigation";
import { fetchRandomArticleTitle, buildWikiPath } from "@/lib/wikipedia";

interface RandomPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function RandomPage({ searchParams }: RandomPageProps) {
  const { lang } = await searchParams;
  const langCode = lang ?? "en";

  const title = await fetchRandomArticleTitle(langCode);
  if (!title) redirect(buildWikiPath("Main_Page", langCode));
  const slug = title.replace(/\s+/g, "_");
  redirect(buildWikiPath(slug, langCode));
}
