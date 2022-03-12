import Alert from '@reach/alert';
import { useState, useRef, useEffect } from 'react';
import { useFetchers } from 'remix';
import { RefreshIcon } from '@heroicons/react/outline';

export const Toast = ({ message, className }) => {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (message !== null) setShow(true);
  }, [message]);

  useEffect(() => {
    if (!show) return;
    timerRef.current = setTimeout(() => {
      setShow(false);
    }, 3000);
    return () => clearTimeout(timerRef);
  }, [show]);

  return (
    <>
      {show ? (
        <Alert
          className={`fixed rounded-md border-l-4 bg-white py-2 px-4 shadow-md ring-1 ring-gray-200 ${className}`}
        >
          {message}
        </Alert>
      ) : null}
    </>
  );
};

export const ToastWithSpinner = ({ message, className = '' }) => {
  const fetchers = useFetchers();
  let deletingFetchers = 0;

  for (const f of fetchers) {
    if (f.submission?.formData.get('action') === 'delete') {
      deletingFetchers++;
    }
  }

  return (
    <>
      {deletingFetchers > 0 ? (
        <Alert
          className={`fixed top-1/4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border-l-4 border-blue-500 bg-white py-2 px-4 shadow-md ring-1 ring-gray-200 ${className}`}
        >
          <RefreshIcon className="h-4 animate-spin" /> {message}
        </Alert>
      ) : null}
    </>
  );
};
