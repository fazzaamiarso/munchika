import { useEffect } from 'react';

export const useFocusOnError = (ref, fieldErrors) => {
  useEffect(() => {
    const form = ref.current;
    if (!form || !fieldErrors) return;

    for (const fieldName of Object.keys(fieldErrors)) {
      if (fieldErrors[fieldName]) {
        const errorField = document.getElementById(fieldName);
        errorField?.focus();
        break;
      }
    }
  }, [ref, fieldErrors]);
};
