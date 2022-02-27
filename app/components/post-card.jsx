import { useNavigate } from 'remix';
import { PostMenu } from './post-menu';

export const PostCard = ({
  postWithUser: post,
  currentUserId,
  displayUser = true,
  displayTrack = true,
}) => {
  const navigate = useNavigate();
  const isPostOwner = post.author_id === currentUserId;

  const handleToFeed = () => navigate(`/track/${post.track_id}`);

  return (
    <li className="max-w-lg space-y-4 self-stretch rounded-md bg-white p-4 shadow-md ring-1 ring-slate-300">
      <div className="flex w-full items-center gap-2 ">
        {displayUser ? (
          <>
            <img
              src={post.avatar}
              alt={post.username}
              className="aspect-square h-8 rounded-full bg-gray-200"
            />
            <div className="flex w-full flex-col items-start ">
              <p>{isPostOwner ? 'You' : post.username}</p>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toDateString()}
              </span>
            </div>
          </>
        ) : null}
        {isPostOwner ? (
          <div className="ml-auto ">
            <PostMenu postId={post.id} />
          </div>
        ) : null}
      </div>
      {displayTrack ? (
        <div
          onClick={handleToFeed}
          className="mb-4 flex  items-center gap-4 rounded-sm shadow-md ring-1 ring-slate-200 transition-all hover:cursor-pointer hover:ring-2 hover:ring-gray-300"
        >
          <img src={post.thumbnail} alt={post.title} className="h-16" />
          <div className="pr-4">
            <p className="text-sm font-semibold">{post.title}</p>
            <p className="text-xs">{post.artist}</p>
          </div>
        </div>
      ) : null}
      <section className="space-y-4 ">
        {post.lyrics === '' ? null : (
          <div>
            <h4 className="text-lg font-semibold">Featured lyrics</h4>
            <p className="text-justify indent-8  text-gray-700">
              {post.lyrics}
            </p>
          </div>
        )}
        <div>
          <h4 className=" font-semibold">Thought</h4>
          <p className="text-justify indent-8 text-gray-700">{post.thought}</p>
        </div>
      </section>
    </li>
  );
};
