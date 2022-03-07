export const BASE_URL = `https://api.genius.com/`;

export const fetchFromGenius = async requestPath => {
  const url = `${BASE_URL}${requestPath}`;
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

export const getPostWithTrack = async posts => {
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

export const removeTranslation = title => {
  const regex = /\(english translation\)/i;
  const replacedWord = title.replace(regex, '');
  return replacedWord.trim();
};
