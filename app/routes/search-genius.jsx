import { fetchFromGenius } from '../utils/geniusApi.server';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('query');

  const response = await fetchFromGenius(`search?q=${searchTerm}`);
  const data = response.hits;

  return data;
};

export default function Bug() {
  return null;
}
