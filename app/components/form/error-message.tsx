import { ExclamationIcon } from '@heroicons/react/solid';
import { ReactNode } from 'react';

type Props = { id: string; children: ReactNode };
export const ErrorMessage = ({ id, children }: Props) => {
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
