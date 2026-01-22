import { Movie } from "./movie";

export type SeriesDetailResponse = {
  series: {
    tmdbId: number;
    name: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;

    firstAirDate?: string;
    lastAirDate?: string;

    numberOfSeasons?: number;
    numberOfEpisodes?: number;

    voteAverage: number;
    voteCount?: number;
    popularity?: number;

    status?: string;

    genres: {
      id: number;
      name: string;
    }[];

    creators: {
      id: number;
      name: string;
      profilePath: string | null;
    }[];
  };

  cast: {
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
  }[];

  creators: {
    id: number;
    name: string;
    profilePath: string | null;
  }[];
};
