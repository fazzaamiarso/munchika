import { useTransition } from '@remix-run/react';

export const useTransitionActionType = <T extends string>(): T => {
  const transition = useTransition();
  const transitionAction = transition.submission?.formData.get('action') as T;
  return transitionAction;
};
