import { useEffect } from 'react';

export const useFocusToHeading = () => {
  useEffect(() => {
    const headingElement = document.querySelector('h1');
    headingElement.focus();
  }, []);
};
