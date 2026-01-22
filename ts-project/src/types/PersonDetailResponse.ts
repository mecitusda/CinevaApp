export type Person = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownForDepartment: string;
};

export type PersonMovies = {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    year?: string;
    role?: string;
  };

export type PersonDetailResponse = {
  person: Person,
  movies: PersonMovies[]
};
