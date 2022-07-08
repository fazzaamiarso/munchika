export const Footer = () => {
  return (
    <footer className="mt-12 flex  w-screen flex-col gap-6 bg-gray-800 py-8 px-16 text-white">
      <section className="flex w-full flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
        <p>
          All user avatar come from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.figma.com/community/file/829741575478342595"
            className="font-semibold hover:underline"
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
            className="font-semibold hover:underline"
          >
            Genius
          </a>
        </p>
      </section>
      <section className="self-center text-center">
        <p>Created by Fazza Razaq Amiarso for Hashnode x Netlify Hackathon</p>
        <p>This website is not a commercial product</p>
      </section>
    </footer>
  );
};
