import { useRef, useEffect } from 'react';

export const usePrevious = <T extends unknown>(value: T) => {
  const savedValue = useRef<T | null>(null);
  useEffect(() => {
    savedValue.current = value;
  }, [value]);
  return savedValue.current;
};
