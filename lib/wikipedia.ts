const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1";

const USER_AGENT =
  "OpenpediaClient/1.0 (https://github.com/; educational project)";

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

function rewriteWikiLinks(html: string): string {
  return html.replace(
    /href="(?:https?:\/\/en\.wikipedia\.org)?(\/wiki\/[^"]+)"/g,
    (_, path) => `href="${path}"`
  );
}

export interface WikipediaSearchResult {
  title: string;
  slug: string;
}

export async function fetchRandomArticleTitle(): Promise<string | null> {
  const res = await fetch(
    `${WIKI_API}?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`,
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
  limit = 8
): Promise<WikipediaSearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `${WIKI_API}?action=opensearch&search=${encodeURIComponent(
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
  title: string
): Promise<WikipediaArticle | null> {
  const encodedTitle = encodeURIComponent(title.replace(/_/g, " "));

  const [summaryRes, parseRes, revisionsRes] = await Promise.all([
    fetch(`${WIKI_REST}/page/summary/${encodedTitle}`, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    }),
    fetch(
      `${WIKI_API}?action=parse&page=${encodedTitle}&prop=text|sections|categories&format=json&origin=*`,
      {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 3600 },
      }
    ),
    fetch(
      `${WIKI_API}?action=query&prop=revisions&rvprop=content&titles=${encodedTitle}&format=json&origin=*`,
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
  const html = rewriteWikiLinks(parse.text["*"]);

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
  continueFrom?: string
): Promise<{ revisions: WikipediaRevision[]; continue?: string }> {
  const encodedTitle = encodeURIComponent(title.replace(/_/g, " "));
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

  const res = await fetch(`${WIKI_API}?${params}`, {
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
  toRevId: number
): Promise<WikipediaCompareResult | null> {
  const params = new URLSearchParams({
    action: "compare",
    fromrev: String(fromRevId),
    torev: String(toRevId),
    prop: "diff|ids|title|user|timestamp|comment",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${WIKI_API}?${params}`, {
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
    diffHtml: rewriteWikiLinks(diffHtml),
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
