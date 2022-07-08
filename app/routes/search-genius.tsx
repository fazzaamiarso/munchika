import { LoaderFunction } from '@remix-run/node';
import { searchGenius } from '../utils/geniusApi.server';

export const loader: LoaderFunction = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('query');
  if (!searchTerm) return null;

  const response = await searchGenius({ searchQuery: searchTerm });
  const data = response.hits;

  return data;
};
