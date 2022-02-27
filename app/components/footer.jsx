export const Footer = () => {
  return (
    <footer className="mt-4 w-screen bg-gray-800 py-8 text-white">
      <section>
        <p>Created by Fazza Razaq Amiarso for Hashnode x Netlify Hackathon</p>
        <p>This website is not a commercial product</p>
      </section>
      <section>
        <p>
          All user avatar come from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.figma.com/community/file/829741575478342595"
            className="hover:underline"
          >
            Avatar Illustration System
          </a>{' '}
          by Micah Lanier
        </p>
        <p>
          All music data come from an api by{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://genius.com"
            className="hover:underline"
          >
            Genius
          </a>
        </p>
      </section>
    </footer>
  );
};
