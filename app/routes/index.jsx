import { Link, useNavigate } from 'remix';

export default function Index() {
  const navigate = useNavigate();
  return (
    <header className="">
      <nav>
        <ul className="">
          <li className="">
            <Link to="/">Home</Link>
          </li>
          <li className="">
            <Link to="/search">Search</Link>
          </li>
        </ul>
      </nav>
      <button
        onClick={() => navigate('post/new')}
        className="bg-pink-400 py-1 px-4"
      >
        Add Thought
      </button>
    </header>
  );
}
