import { redirect } from "next/navigation";
import { fetchRandomArticleTitle } from "@/lib/wikipedia";

export default async function RandomPage() {
  const title = await fetchRandomArticleTitle();
  if (!title) redirect("/wiki/Main_Page");
  const slug = title.replace(/\s+/g, "_");
  redirect(`/wiki/${encodeURIComponent(slug)}`);
}
