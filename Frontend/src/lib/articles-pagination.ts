import type { PaginationMeta } from "@/lib/api";

/** Page 1: magazine layout (1 lead + 3 side + 9 grid). Pages 2+: 12-card grid (3×4). */
export const FIRST_PAGE_SIZE = 13;
export const REST_PAGE_SIZE = 12;

export function getListingPageParams(page: number) {
  const safePage = Math.max(1, page);
  if (safePage === 1) {
    return { page: 1, limit: FIRST_PAGE_SIZE, skip: 0 };
  }
  return {
    page: safePage,
    limit: REST_PAGE_SIZE,
    skip: FIRST_PAGE_SIZE + (safePage - 2) * REST_PAGE_SIZE,
  };
}

export function buildListingPaginationMeta(total: number, page: number): PaginationMeta {
  const safePage = Math.max(1, page);
  const totalPages =
    total <= FIRST_PAGE_SIZE ? 1 : 1 + Math.ceil((total - FIRST_PAGE_SIZE) / REST_PAGE_SIZE);
  const limit = safePage === 1 ? FIRST_PAGE_SIZE : REST_PAGE_SIZE;
  return { total, page: safePage, limit, totalPages };
}

export function getListingRange(meta: PaginationMeta) {
  if (meta.total === 0) return { from: 0, to: 0 };
  const from =
    meta.page === 1 ? 1 : FIRST_PAGE_SIZE + (meta.page - 2) * REST_PAGE_SIZE + 1;
  const to =
    meta.page === 1
      ? Math.min(FIRST_PAGE_SIZE, meta.total)
      : Math.min(FIRST_PAGE_SIZE + (meta.page - 1) * REST_PAGE_SIZE, meta.total);
  return { from, to };
}
