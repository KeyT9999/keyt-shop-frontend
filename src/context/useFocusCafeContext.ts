import { useContext } from 'react';
import { FocusCafeContext } from './focus-cafe-context';

export function useFocusCafeContext() {
  const context = useContext(FocusCafeContext);
  if (!context) {
    throw new Error(
      'useFocusCafeContext must be used within FocusCafeProvider'
    );
  }
  return context;
}
