import {Movie} from "./movie"
export type RecommendedRow = {
  movies: Movie[];
  reason: { text: string } | null;
  page: number;
  loading?: boolean;
  hasMore?: boolean
};

type PagedRow = {
  movies: Movie[];
  page: number;
  loading?: boolean;
  hasMore?: boolean; // istersen
};



export type RowsState = {
  trending: PagedRow;
  discovery: PagedRow;
  recommended: RecommendedRow | null;
};

export type ScrollableRow = "trending" | "discovery";
export type RowType = ScrollableRow | "recommended";