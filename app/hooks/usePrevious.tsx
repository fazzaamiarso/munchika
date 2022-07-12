import { useRef, useEffect } from 'react';

export const usePrevious = <T,>(value: T) => {
  const savedValue = useRef<T>(value);
  useEffect(() => {
    savedValue.current = value;
  }, [value]);
  return savedValue.current;
};
