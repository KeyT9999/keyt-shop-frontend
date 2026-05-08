import { useState } from 'react';
import { splitClaims } from '../services/evidenceService';

export function useClaimSplitter() {
  const [claims, setClaims] = useState<string[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitError, setSplitError] = useState('');

  const splitText = async (text: string, apiKey: string) => {
    setIsSplitting(true);
    setSplitError('');

    try {
      const nextClaims = await splitClaims(text, apiKey);
      setClaims(nextClaims);
      return nextClaims;
    } catch (error: any) {
      const message = error?.message || 'Đã xảy ra lỗi khi tách claim.';
      setSplitError(message);
      return [];
    } finally {
      setIsSplitting(false);
    }
  };

  const clearClaims = () => {
    setClaims([]);
    setSplitError('');
  };

  return { claims, isSplitting, splitError, splitText, clearClaims };
}
