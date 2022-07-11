import { LoaderFunction } from '@remix-run/node';

// An API route that is used as workaround to reset a fetcher data. Although, only the data is resetted.
export const loader: LoaderFunction = () => {
  return null;
};
