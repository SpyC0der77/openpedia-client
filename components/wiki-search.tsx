"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchWikipedia, type WikipediaSearchResult } from "@/lib/wikipedia";

interface WikiSearchProps {
  onSelect?: () => void;
}

export function WikiSearch({ onSelect }: WikiSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WikipediaSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchWikipedia(q, 8);
      setSuggestions(results);
      setIsOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(query), 200);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  const handleSelect = (slug: string) => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    router.push(`/wiki/${encodeURIComponent(slug)}`);
    onSelect?.();
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search Openpedia"
          className="h-8 pl-8 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </div>
      {isOpen && query.trim() && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {isLoading ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    className="w-full rounded-sm px-3 py-2 text-left text-sm text-blue-600 hover:bg-accent hover:text-accent-foreground dark:text-blue-400 dark:hover:bg-accent dark:hover:text-accent-foreground"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(item.slug);
                    }}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
