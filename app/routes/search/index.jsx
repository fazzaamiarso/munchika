import { useLoaderData } from 'remix';
import { supabase } from '../../../server/db.server';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term');

  if (searchTerm === null) {
    const { data } = await supabase
      .from('post')
      .select()
      .order('created_at', { ascending: false });
    return { data };
  }
  return {};
};

export default function SearchPost() {
  const { data } = useLoaderData();
  return (
    <>
      <h2 className="">Search post</h2>
      <ul className="">
        {data.map(post => {
          return (
            <li key={post.id} className="">
              <h3 className="text-lg">{post.track_id}</h3>
              <p>{post.lyrics}</p>
              <p>{post.thought}</p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
