export type MyListRecentItem = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  action: "view";
  createdAt: string;
  title: string;
  posterPath: string
};

export type MyListUserItem = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: string;
};

export type MyListResponse = {
  recentlyViewed: MyListRecentItem[];
  favorites: MyListUserItem[];
  following: MyListUserItem[];
};
