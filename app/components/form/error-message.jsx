import { ExclamationIcon } from '@heroicons/react/solid';

export const ErrorMessage = ({ id, children }) => {
  return (
    <p
      aria-live="polite"
      role="status"
      aria-atomic="true"
      className="flex items-center gap-1 text-sm leading-none text-red-600"
      id={id}
    >
      {children ? <ExclamationIcon className="h-4" aria-hidden="true" /> : null} {children}
    </p>
  );
};
