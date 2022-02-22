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

export const removeTranslation = title => {
  const regex = /\(english translation\)/i;
  const replacedWord = title.replace(regex, '');
  return replacedWord.trim();
};
