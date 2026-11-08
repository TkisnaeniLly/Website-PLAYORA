import { useQuery } from "@tanstack/react-query";
import { getArticleDetail, getArticleFilters, getArticles } from "@/lib/articles";
import type { ArticlesQuery, ArticleType } from "@/types/articles";

export function useArticles(query: ArticlesQuery) {
  return useQuery({
    queryKey: ["articles", query],
    queryFn: () => getArticles(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useArticleFilters() {
  return useQuery({
    queryKey: ["articles", "filters"],
    queryFn: getArticleFilters,
    staleTime: 5 * 60_000,
  });
}

export function useArticleDetail(slug: string | undefined, tipe: ArticleType) {
  return useQuery({
    queryKey: ["articles", "detail", tipe, slug],
    queryFn: () => getArticleDetail(slug as string, tipe),
    enabled: typeof slug === "string" && slug.length > 0,
    retry: false,
  });
}
