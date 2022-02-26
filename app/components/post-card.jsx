import { Link } from 'remix';
import { PostMenu } from './post-menu';

export const PostCard = ({ postWithUser: post, currentUserId }) => {
  return (
    <li className="max-w-lg space-y-2 rounded-md p-4 shadow-md ring-1 ring-slate-200">
      <div className="flex w-full items-center gap-2 ">
        <img
          src={post.avatar}
          alt={post.username}
          className="aspect-square h-8 rounded-full bg-gray-200"
        />
        <div className="flex w-full flex-col items-start ">
          <p>{post.username}</p>
          <span className="text-xs text-gray-400">{post.created_at}</span>
        </div>
        {currentUserId === post.author_id ? (
          <div className="ml-auto ">
            <PostMenu postId={post.id} />
          </div>
        ) : null}
      </div>
      <div className="mb-4 flex items-center gap-4 rounded-sm shadow-md ring-1 ring-slate-200 transition-transform hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg">
        <img src={post.thumbnail} alt={post.title} className="h-16" />
        <div className="pr-4">
          <p className="text-sm font-semibold">{post.title}</p>
          <p className="text-xs">{post.artist}</p>
          <Link
            to={`/track/${post.track_id}`}
            className="text-xs text-blue-500 hover:underline"
          >
            Go to song&apos;s feed ➡
          </Link>
        </div>
      </div>
      <section className="space-y-4">
        <div>
          <h4 className="text-md font-semibold">Featured lyrics</h4>
          <p className="text-justify indent-8">{post.lyrics}</p>
        </div>
        <div>
          <h4 className="text-md font-semibold">Thought</h4>
          <p className="text-justify indent-8">{post.thought}</p>
        </div>
      </section>
    </li>
  );
};
