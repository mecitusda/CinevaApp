const axios = require('axios');

const tmdb = (language="tr-TR") => axios.create({
  baseURL: process.env.TMDB_BASE_URL,
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: language,
  },
  timeout: 5000,
});


function mapSearchItem(raw) {
  return {
    tmdbId: raw.id,
    mediaType: raw.media_type, // movie | tv
    title: raw.title || raw.name,
    overview: raw.overview,
    originalTitle: raw.original_title || raw.original_name,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    year: (raw.release_date || raw.first_air_date)?.slice(0, 4) ?? null,
    popularity: raw.popularity,
    voteAverage: raw.vote_average,
  };
}


const mapMovie = (m) => {
  return {
    tmdbId: m.id,
    title: m.title,
    overview: m.overview,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    releaseDate: m.release_date,
    voteAverage: m.vote_average,
    genreIds: m.genre_ids,
  };
}


const mapSeries = (m) => {
  return {
    tmdbId: m.id,
    title: m.name,
    overview: m.overview,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    releaseDate: m.release_date,
    voteAverage: m.vote_average,
    genreIds: m.genre_ids,
  };
}

async function getTrending({
  page = 1,
  excludeIds = [],
  limit = 20,
} = {}) {
  const excludeSet = new Set(excludeIds.map(String));
  const seenSet = new Set(); // 🔥 EN KRİTİK EKLEME

  let currentPage = page;
  let totalPages = 1;
  const collected = [];

  while (collected.length < limit && currentPage <= totalPages) {
    const { data } = await tmdb().get('/trending/movie/day', {
      params: { page: currentPage },
    });

    totalPages = data.total_pages;

    for (const raw of data.results) {
      const movie = mapMovie(raw);
      const id = String(movie.tmdbId);

      // ❌ dışlanan
      if (excludeSet.has(id)) continue;

      // ❌ bu fetch sırasında daha önce gelmiş
      if (seenSet.has(id)) continue;

      seenSet.add(id);
      collected.push(movie);

      if (collected.length >= limit) break;
    }

    currentPage++;
  }

  return {
    movies: collected,
    page: currentPage - 1,
    totalPages,
  };
}


async function getMovieById(id) {
  const { data } = await tmdb().get(`/movie/${id}`);

  return {
    tmdbId: data.id,

    title: data.title,
    originalTitle: data.original_title,
    overview: data.overview,
    tagline: data.tagline || null,

    posterPath: data.poster_path || null,
    backdropPath: data.backdrop_path || null,

    releaseDate: data.release_date || null,
    runtime: data.runtime ?? null,
    status: data.status,

    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    popularity: data.popularity,

    adult: data.adult, // 🔞 burada karar vereceksin UI'da
    originalLanguage: data.original_language,

    imdbId: data.imdb_id || null,
    homepage: data.homepage || null,

    genres: data.genres?.map(g => ({
      id: g.id,
      name: g.name,
    })) || [],

    productionCompanies: data.production_companies?.map(c => ({
      id: c.id,
      name: c.name,
      logoPath: c.logo_path || null,
      originCountry: c.origin_country,
    })) || [],

    productionCountries: data.production_countries?.map(c => ({
      iso: c.iso_3166_1,
      name: c.name,
    })) || [],

    spokenLanguages: data.spoken_languages?.map(l => ({
      iso: l.iso_639_1,
      name: l.name,
      englishName: l.english_name,
    })) || [],
  };
}


async function searchMulti({ query, page = 1 }) {
  const { data } = await tmdb().get('/search/multi', {
    params: {
      query,
      page,
      include_adult: false,
    },
  });
  return data.results
    .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
    .map(mapSearchItem);
}

async function discoverByGenre(
  genreId,
  { page = 1, minVote = 3 } = {}
) {
  const { data } = await tmdb().get('/discover/movie', {
    params: {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      ...(minVote && { 'vote_average.gte': minVote }),
    },
  });

  return {
    movies: data.results.map(mapMovie),
    page: data.page,
    totalPages: data.total_pages,
  };
}

async function getTrendingMore({ excludeIds, limit }) {
  let page = 1;
  let collected = [];
  const excluded = new Set(excludeIds.map(String));

  while (collected.length < limit) {
    const { data } = await tmdb().get('/trending/movie/day', {
      params: { page },
    });

    const fresh = data.results
      .map(mapMovie)
      .filter(m => !excluded.has(String(m.tmdbId)));

    collected.push(...fresh);

    if (page >= data.total_pages) break;
    page++;
  }

  return collected.slice(0, limit);
}

async function discoverRandom({
  page = 1,
  minVote = 7,
  excludeIds = [],
  limit = 20,
} = {}) {
  const excludeSet = new Set(excludeIds.map(String));
  const seenSet = new Set(); // 🔥 kritik

  let currentPage = page;
  let totalPages = 1;
  const collected = [];

  while (collected.length < limit && currentPage <= totalPages) {
    const { data } = await tmdb().get('/discover/movie', {
      params: {
        sort_by: 'popularity.desc',
        'vote_average.gte': minVote,
        page: currentPage,
      },
    });

    totalPages = data.total_pages;

    for (const raw of data.results) {
      const movie = mapMovie(raw);
      const id = String(movie.tmdbId);

      // ❌ dışlanan
      if (excludeSet.has(id)) continue;

      // ❌ bu çağrıda daha önce geldiyse
      if (seenSet.has(id)) continue;

      seenSet.add(id);
      collected.push(movie);

      if (collected.length >= limit) break;
    }

    currentPage++;
  }

  return {
    movies: collected,
    page: currentPage - 1,
    totalPages,
  };
}

async function discoverMore({ excludeIds, limit, minVote }) {
  let page = 1;
  let collected = [];
  const excluded = new Set(excludeIds.map(String));

  while (collected.length < limit) {
    const { data } = await tmdb().get('/discover/movie', {
      params: {
        page,
        sort_by: 'popularity.desc',
        'vote_average.gte': minVote,
      },
    });

    const fresh = data.results
      .map(mapMovie)
      .filter(m => !excluded.has(String(m.tmdbId)));

    collected.push(...fresh);

    if (page >= data.total_pages) break;
    page++;
  }

  return collected.slice(0, limit);
}

async function discoverMovies({ genre, minVote, sort }) {
  const { data } = await tmdb().get('/discover/movie', {
    params: {
      with_genres: genre,
      'vote_average.gte': minVote,
      sort_by: sort || 'popularity.desc',
    },
  });

  return data.results.map(mapMovie);
}

async function getMovieTrailer(movieId) {
  const { data } = await tmdb("en-US").get(`/movie/${movieId}/videos`);

  const trailer =
    data.results.find(
      v =>
        v.site === 'YouTube' &&
        v.type === 'Trailer' &&
        v.official === true
    ) ||
    data.results.find(
      v =>
        v.site === 'YouTube' &&
        ['Teaser', 'Clip'].includes(v.type)
    );

  if (!trailer) return null;

  return {
    key: trailer.key,
    embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
    watchUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
  };
}

async function getSimilarMovies({ movieId, page = 1, excludeIds = [], limit = 20 }) {
  const excludeSet = new Set((excludeIds || []).map(Number));

  const out = [];
  let currentPage = Number(page) || 1;

  // TMDB bazen filtre sonrası az sonuç bırakır.
  // Limit'i doldurmak için birkaç sayfa ilerlemeyi deniyoruz.
  // (Çok abartmayalım: 3 sayfa yeterli)
  const MAX_PAGES_TO_TRY = 3;
  let tried = 0;

  while (out.length < limit && tried < MAX_PAGES_TO_TRY) {
    const { data } = await tmdb().get(`/movie/${movieId}/similar`, {
      params: { page: currentPage },
    });

    const results = Array.isArray(data?.results) ? data.results : [];

    for (const m of results) {
      if (!m?.id) continue;

      // exclude
      if (excludeSet.has(m.id)) continue;

      // UI için poster şart (istersen kaldırırız)
      if (!m.poster_path) continue;

      out.push({
        tmdbId: m.id,
        title: m.title,
        overview: m.overview,
        posterPath: m.poster_path,
        backdropPath: m.backdrop_path,
        releaseDate: m.release_date,
        voteAverage: m.vote_average,
        genreIds: m.genre_ids ?? [],
      });

      if (out.length >= limit) break;
    }

    // TMDB’de daha fazla sayfa yoksa çık
    const totalPages = Number(data?.total_pages || 0);
    if (!totalPages || currentPage >= totalPages) break;

    currentPage += 1;
    tried += 1;
  }

  return out;
}

// services/tmdb.service.js

async function getMovieCast(id) {
  const { data } = await tmdb().get(`/movie/${id}/credits`);

  return (data.cast || [])
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    }));
}

async function getMovieDirectors(movieId) {
  const { data } = await tmdb().get(`/movie/${movieId}/credits`);

  return data.crew
    .filter(p => p.job === "Director")
    .map(p => ({
      id: p.id,
      name: p.name,
      profilePath: p.profile_path ?? null,
    }));
}

async function getPersonById(personId) {
  const { data } = await tmdb().get(
    `/person/${personId}`
  );
 
  return {
    id: data.id,
    name: data.name,
    biography: data.biography,
    birthday: data.birthday,
    deathday: data.deathday,
    placeOfBirth: data.place_of_birth,
    profilePath: data.profile_path,
    knownForDepartment: data.known_for_department,
    popularity: data.popularity,
  };
}

async function getPersonCredits(personId) {
  const { data } = await tmdb().get(
    `/person/${personId}/combined_credits`,
  );
  console.log(data)
  const movies = [...data.cast, ...data.crew]
    .filter(m => m.media_type === "movie")
    .filter(
      (v, i, arr) =>
        arr.findIndex(x => x.id === v.id) === i
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10)
    .map(m => ({
      tmdbId: m.id,
      title: m.title,
      posterPath: m.poster_path,
      year: m.release_date?.slice(0, 4),
      role: m.character || m.job,
    }));

  return movies;
}

async function getMoviesByGenre({genre, page, excludeIds}) {
  const { data } = await tmdb().get("/discover/movie", {
    params: {
      with_genres: genre,
      page,
      sort_by: "popularity.desc",
    },
  });

  const movies = data.results
    .filter(m => !excludeIds.includes(m.id))
    .map(mapMovie);

  return {
    movies,
    page,
    totalPages: data.total_pages,
    hasMore: page < data.total_pages,
    genre: parseInt(genre)
  };
}

async function getSeriesByGenre({ genre, page, excludeIds }) {

  const { data } = await tmdb().get("/discover/tv", {
    params: {
      with_genres: genre,
      page,
      sort_by: "popularity.desc",
    },
  });

  let series = data.results.map(mapSeries);
  if (excludeIds?.length) {
    series = series.filter(
      m => !excludeIds.includes(m.tmdbId)
    );
  }

  return {
    series,
    page,
    hasMore: page < data.total_pages,
    genre
  };
}

async function getSeriesById(id) {
  const { data } = await tmdb().get(`/tv/${id}`);
  return {
    tmdbId: data.id,
    name: data.name,
    overview: data.overview,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,

    firstAirDate: data.first_air_date,
    lastAirDate: data.last_air_date,

    numberOfSeasons: data.number_of_seasons,
    numberOfEpisodes: data.number_of_episodes,

    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    popularity: data.popularity,

    status: data.status,
    genres: data.genres ?? [],

    creators: (data.created_by || []).map(c => ({
      id: c.id,
      name: c.name,
      profilePath: c.profile_path ?? null,
    })),
  };
}


async function getSeriesCast(id) {
  const { data } = await tmdb().get(`/tv/${id}/credits`);

  return (data.cast || [])
    .slice(0, 20)
    .map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    }));
}

async function getSeriesTrailer(id) {
  const {data} = await tmdb("en-US").get(`/tv/${id}/videos`, {
  });
  console.log(data)
  const trailer =
    data.results.find(v => v.site === "YouTube" && v.type === "Trailer") ||
    null;
      console.log("trailer:",data)
  if (!trailer) return null;

  return {
    key: trailer.key,
    embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
  };
}

async function getSimilarSeries({ seriesId, page = 1 }) {
  const { data } = await tmdb().get(`/tv/${seriesId}/similar`, {
    params: { page },
  });

  return {
    series: (data.results || []).map(s => ({
      tmdbId: s.id,
      title: s.name,
      posterPath: s.poster_path,
      backdropPath: s.backdrop_path,
      voteAverage: s.vote_average,
      genreIds: s.genre_ids,
      firstAirDate: s.first_air_date,
    })),
    page: data.page,
    hasMore: data.page < data.total_pages,
  };
}
module.exports = {
  getTrending,
  getMovieById,
  searchMulti,
  discoverByGenre,
  discoverRandom,
  discoverMovies,
  getMovieTrailer,
  getTrendingMore,
  discoverMore,
  getSimilarMovies,
  getMovieCast,
  getMovieDirectors,
  getPersonById,
  getPersonCredits,
  getMoviesByGenre,
  getSeriesByGenre,
  getSeriesById,
  getSeriesCast,
  getSeriesTrailer,
  getSimilarSeries
};
