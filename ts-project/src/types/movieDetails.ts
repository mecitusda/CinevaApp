export type MovieDetail = {
  tmdbId: number;

  title: string;
  originalTitle: string;
  overview: string;
  tagline: string | null;

  posterPath: string | null;
  backdropPath: string | null;

  releaseDate: string | null;
  runtime: number | null;
  status: string;

  voteAverage: number;
  voteCount: number;
  popularity: number;

  adult: boolean; // 🔞 +18 için
  originalLanguage: string;

  imdbId: string | null;
  homepage: string | null;

  genres: {
    id: number;
    name: string;
  }[];

  productionCompanies: {
    id: number;
    name: string;
    logoPath: string | null;
    originCountry: string;
  }[];

  productionCountries: {
    iso: string;
    name: string;
  }[];

  spokenLanguages: {
    iso: string;
    name: string;
    englishName: string;
  }[];
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};


export type MovieDetailResponse = {
  movie: MovieDetail;
  cast: CastMember[];
  directors: {
    id: number;
    name: string;
    profilePath: string | null;
  }[];
};