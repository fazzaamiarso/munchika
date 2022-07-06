export const BASE_URL = `https://api.genius.com/`;

interface GeniusResponse {
  song: {
    title: string;
    primary_artist: { name: string };
    song_art_image_thumbnail_url: string;
  };
}

interface BaseEntity {
  id: string;
  created_at: Date;
}

interface User extends BaseEntity {
  username: string;
  avatar_url: string;
}
export interface Post extends BaseEntity {
  thought: string;
  lyrics: string;
  author_id: string;
  track_id: number;
  user: User;
}

interface PostWithTrack extends Post {
  username: string;
  avatar: string;
  title: string;
  artist: string;
  thumbnail: string;
}

export const fetchFromGenius = async (requestPath: string) => {
  const url = `${BASE_URL}${requestPath}`;
  const encodedURL = encodeURI(url); //replace character with escape sequence of UTF-8 encoding

  const response = await fetch(encodedURL, {
    headers: {
      Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
    },
  });
  const jsonData = await response.json();
  const data = jsonData.response as GeniusResponse;
  return data;
};

export const getPostWithTrack = async (posts: Post[]) => {
  const tracks = posts.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      created_at: post.created_at,
      username: post.user.username,
      avatar: post.user.avatar_url,
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
