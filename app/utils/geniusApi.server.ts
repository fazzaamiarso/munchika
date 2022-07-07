import { Post } from '~/types/database';

export const BASE_URL = `https://api.genius.com/`;

export interface GeniusTrackData {
  title: string;
  primary_artist: { name: string };
  song_art_image_thumbnail_url: string;
  url: string;
  song_art_image_url: string;
  release_date: string;
  id: number;
}

export const searchGenius = async ({
  searchQuery,
  currentPage = 1,
  perPage = 10,
}: {
  searchQuery: string;
  currentPage?: number;
  perPage?: number;
}): Promise<{ hits: GeniusTrackData[] }> => {
  const url = `${BASE_URL}search?q=${searchQuery}&per_page=${perPage}&page=${currentPage}`;
  const encodedURL = encodeURI(url); //replace character with escape sequence of UTF-8 encoding

  const response = await fetch(encodedURL, {
    headers: {
      Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
    },
  });
  const jsonData = await response.json();
  const data = jsonData.response;
  return data;
};

export const fetchFromGenius = async (requestPath: string): Promise<{ song: GeniusTrackData }> => {
  const url = `${BASE_URL}${requestPath}`;
  const encodedURL = encodeURI(url);

  const response = await fetch(encodedURL, {
    headers: {
      Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
    },
  });
  const jsonData = await response.json();
  const data = jsonData.response;
  return data;
};

export const getPostWithTrack = async (posts: Post[]) => {
  const tracks = posts.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      created_at: post.created_at,
      title: removeTranslation(track.title),
      artist: track.primary_artist.name,
      thumbnail: track.song_art_image_thumbnail_url,
    };
  });
  const trackDatas = await Promise.all(tracks);
  return trackDatas;
};

export const removeTranslation = (title: string) => {
  const regex = /\(english translation\)/i;
  const replacedWord = title.replace(regex, '');
  return replacedWord.trim();
};
