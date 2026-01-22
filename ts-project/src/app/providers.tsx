import { ReactNode } from 'react';
import { useMeQuery } from '../features/auth/useMeQuery';

type Props = {
  children: ReactNode;
};

function InitializeAuth() {
  useMeQuery();
  return null;
}

export function Providers({ children }: Props) {
  return (
    <>
      <InitializeAuth />
      {children}
    </>
  );
}
