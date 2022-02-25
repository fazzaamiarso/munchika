import { Outlet, useLoaderData } from 'remix';
import { supabase } from '../../server/db.server';
import { requireUserId } from '../utils/session.server';

export const loader = async ({ request }) => {
  const userId = await requireUserId(request);

  const { data: userData } = await supabase
    .from('user')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single();

  return { userData };
};

export default function Users() {
  const { userData } = useLoaderData();
  return (
    <>
      <section className="flex flex-col items-center gap-4 border-b-2 border-gray-300 py-4">
        <img
          src={userData.avatar_url}
          alt={userData.username}
          className="aspect-square h-24 rounded-full"
        />
        <div className="">
          <h2 className="text-center text-lg font-bold">{userData.username}</h2>
        </div>
      </section>
      <Outlet />
    </>
  );
}
