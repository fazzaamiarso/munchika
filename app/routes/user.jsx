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
        <div className="aspect-square h-32 rounded-full bg-gray-500" />
        <div className="">
          <h2 className="text-center text-lg font-bold">{userData.username}</h2>
        </div>
      </section>
      <Outlet />
    </>
  );
}
