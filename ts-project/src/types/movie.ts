
export type Movie = {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  releaseDate?: string;
  voteAverage: number;
  genreIds: number[]
};


