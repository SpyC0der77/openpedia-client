const USER_AGENT =
  "OpenpediaClient/1.0 (https://github.com/; educational project)";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "zh", name: "中文" },
] as const;

export type WikiLang = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function buildWikiPath(slug: string, lang: string): string {
  const path = `/wiki/${encodeURIComponent(slug)}`;
  return lang === "en" ? path : `${path}?lang=${lang}`;
}

function getWikiUrls(lang: string) {
  const host = `${lang}.wikipedia.org`;
  return {
    api: `https://${host}/w/api.php`,
    rest: `https://${host}/api/rest_v1`,
  };
}

interface TocSection {
  toclevel: number;
  level: string;
  line: string;
  number: string;
  index: string;
  anchor?: string;
}

interface WikipediaParseResponse {
  parse?: {
    title: string;
    pageid: number;
    text: { "*": string };
    sections?: TocSection[];
    categories?: { "*": string }[];
  };
  error?: { code: string; info: string };
}

interface WikipediaSummaryResponse {
  title?: string;
  extract?: string;
  extract_html?: string;
  thumbnail?: { source: string; width: number; height: number };
  description?: string;
  type?: string;
}

function buildAnchor(line: string): string {
  return line.replace(/\s+/g, "_").replace(/[#/\\?&]/g, "");
}

export interface WikipediaArticle {
  title: string;
  extract: string;
  extractHtml?: string;
  html: string;
  wikitext: string;
  sections: { id: string; title: string; level: number }[];
  categories: string[];
  thumbnail?: { source: string; width: number; height: number };
  description?: string;
}

function rewriteWikiLinks(html: string, lang: string): string {
  const suffix = lang === "en" ? "" : `?lang=${lang}`;
  return html.replace(
    /href="(?:https?:\/\/[a-z0-9-]+\.wikipedia\.org)?(\/wiki\/[^"]+)"/g,
    (_, path) => `href="${path}${suffix}"`
  );
}

export interface WikipediaSearchResult {
  title: string;
  slug: string;
}

export async function fetchRandomArticleTitle(
  lang = "en"
): Promise<string | null> {
  const { api } = getWikiUrls(lang);
  const res = await fetch(
    `${api}?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`,
    { headers: { "User-Agent": USER_AGENT }, next: { revalidate: 0 } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { random?: Array<{ title: string }> };
  };
  const title = data.query?.random?.[0]?.title;
  return title ?? null;
}

export async function searchWikipedia(
  query: string,
  limit = 8,
  lang = "en"
): Promise<WikipediaSearchResult[]> {
  if (!query.trim()) return [];
  const { api } = getWikiUrls(lang);
  const res = await fetch(
    `${api}?action=opensearch&search=${encodeURIComponent(
      query
    )}&limit=${limit}&format=json&origin=*`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as [string, string[], string[], string[]];
  const [, titles, , urls] = data;
  if (!titles?.length || !urls?.length) return [];
  return titles.map((title, i) => {
    const url = urls[i] ?? "";
    const match = url.match(/\/wiki\/(.+)$/);
    const slug = match
      ? decodeURIComponent(match[1])
      : title.replace(/\s+/g, "_");
    return { title, slug };
  });
}

export async function fetchWikipediaArticle(
  title: string,
  lang = "en"
): Promise<WikipediaArticle | null> {
  const encodedTitle = encodeURIComponent(title.replace(/_/g, " "));
  const { api, rest } = getWikiUrls(lang);

  const [summaryRes, parseRes, revisionsRes] = await Promise.all([
    fetch(`${rest}/page/summary/${encodedTitle}`, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    }),
    fetch(
      `${api}?action=parse&page=${encodedTitle}&prop=text|sections|categories&format=json&origin=*`,
      {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 3600 },
      }
    ),
    fetch(
      `${api}?action=query&prop=revisions&rvprop=content&titles=${encodedTitle}&format=json&origin=*`,
      {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 3600 },
      }
    ),
  ]);

  if (!parseRes.ok) return null;

  const parseData = (await parseRes.json()) as WikipediaParseResponse;
  if (parseData.error || !parseData.parse) return null;

  const { parse } = parseData;
  const html = rewriteWikiLinks(parse.text["*"], lang);

  let sections: { id: string; title: string; level: number }[] = [];
  if (parse.sections?.length) {
    sections = parse.sections
      .filter((s) => s.index !== "0")
      .map((s) => ({
        id: s.anchor ?? buildAnchor(s.line),
        title: s.line,
        level: Number(s.toclevel) || 1,
      }));
  }

  const categories =
    parse.categories?.map((c) => c["*"].replace(/^Category:/, "")) ?? [];

  let wikitext = "";
  if (revisionsRes.ok) {
    const revisionsData = (await revisionsRes.json()) as {
      query?: {
        pages?: Record<string, { revisions?: { "*"?: string }[] }>;
      };
    };
    const pages = revisionsData.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0];
      const rev = page?.revisions?.[0];
      if (rev && "*" in rev) wikitext = rev["*"] ?? "";
    }
  }

  let extract = "";
  let extractHtml: string | undefined;
  let thumbnail: WikipediaArticle["thumbnail"];
  let description: string | undefined;

  if (summaryRes.ok) {
    const summaryData = (await summaryRes.json()) as WikipediaSummaryResponse;
    extract = summaryData.extract ?? "";
    extractHtml = summaryData.extract_html;
    thumbnail = summaryData.thumbnail;
    description = summaryData.description;
  }

  return {
    title: parse.title,
    extract,
    extractHtml,
    html,
    wikitext,
    sections,
    categories,
    thumbnail,
    description,
  };
}

export interface WikipediaRevision {
  revid: number;
  timestamp: string;
  user: string;
  userId?: number;
  comment: string;
  size: number;
  minor?: boolean;
}

interface WikipediaRevisionsResponse {
  query?: {
    pages?: Record<
      string,
      {
        revisions?: Array<{
          revid: number;
          timestamp: string;
          user?: string;
          userid?: number;
          comment?: string;
          size?: number;
          minor?: boolean;
        }>;
      }
    >;
  };
  continue?: { rvcontinue?: string };
}

export async function fetchWikipediaRevisions(
  title: string,
  limit = 50,
  continueFrom?: string,
  lang = "en"
): Promise<{ revisions: WikipediaRevision[]; continue?: string }> {
  const encodedTitle = encodeURIComponent(title.replace(/_/g, " "));
  const { api } = getWikiUrls(lang);
  const params = new URLSearchParams({
    action: "query",
    prop: "revisions",
    titles: encodedTitle,
    rvprop: "ids|timestamp|user|userid|comment|size|flags",
    rvlimit: String(limit),
    rvslots: "main",
    format: "json",
    origin: "*",
  });
  if (continueFrom) params.set("rvcontinue", continueFrom);

  const res = await fetch(`${api}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 300 },
  });
  if (!res.ok) return { revisions: [] };

  const data = (await res.json()) as WikipediaRevisionsResponse;
  const pages = data.query?.pages;
  if (!pages) return { revisions: [] };

  const page = Object.values(pages)[0];
  const revs = page?.revisions ?? [];
  const revisions: WikipediaRevision[] = revs.map((r) => ({
    revid: r.revid,
    timestamp: r.timestamp,
    user: r.user ?? "(hidden)",
    userId: r.userid,
    comment: r.comment ?? "",
    size: r.size ?? 0,
    minor: r.minor,
  }));

  return {
    revisions,
    continue: data.continue?.rvcontinue,
  };
}

export interface WikipediaCompareResult {
  fromRevId: number;
  toRevId: number;
  diffHtml: string;
  fromTitle?: string;
  toTitle?: string;
  fromUser?: string;
  toUser?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  fromComment?: string;
  toComment?: string;
}

interface WikipediaCompareResponse {
  compare?: {
    fromrevid: number;
    torevid: number;
    diff?: string;
    "*"?: string; // MediaWiki returns diff under "*" key
    fromtitle?: string;
    totitle?: string;
    fromuser?: string;
    touser?: string;
    fromtimestamp?: string;
    totimestamp?: string;
    fromcomment?: string;
    tocomment?: string;
  };
  error?: { code: string; info: string };
}

export async function fetchWikipediaCompare(
  fromRevId: number,
  toRevId: number,
  lang = "en"
): Promise<WikipediaCompareResult | null> {
  const { api } = getWikiUrls(lang);
  const params = new URLSearchParams({
    action: "compare",
    fromrev: String(fromRevId),
    torev: String(toRevId),
    prop: "diff|ids|title|user|timestamp|comment",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${api}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as WikipediaCompareResponse;
  if (data.error || !data.compare) return null;

  const c = data.compare;
  const diffHtml = c.diff ?? c["*"] ?? "";
  return {
    fromRevId: c.fromrevid,
    toRevId: c.torevid,
    diffHtml: rewriteWikiLinks(diffHtml, lang),
    fromTitle: c.fromtitle,
    toTitle: c.totitle,
    fromUser: c.fromuser,
    toUser: c.touser,
    fromTimestamp: c.fromtimestamp,
    toTimestamp: c.totimestamp,
    fromComment: c.fromcomment,
    toComment: c.tocomment,
  };
}
