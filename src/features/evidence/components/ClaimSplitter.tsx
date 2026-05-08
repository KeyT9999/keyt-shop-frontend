import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useClaimSplitter } from '../hooks/useClaimSplitter';
import './ClaimSplitter.css';

interface ClaimSplitterProps {
  text: string;
  apiKey: string;
  onSelectClaim: (claim: string) => void;
  onCheckAll: (claims: string[]) => void;
}

export default function ClaimSplitter({ text, apiKey, onSelectClaim, onCheckAll }: ClaimSplitterProps) {
  const { claims, isSplitting, splitError, splitText, clearClaims } = useClaimSplitter();
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  useEffect(() => {
    clearClaims();
    setSelectedClaims([]);
    // Reset split state only when the source text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handleSplit = async () => {
    const nextClaims = await splitText(text, apiKey);
    setSelectedClaims(nextClaims);
  };

  const toggleClaim = (claim: string) => {
    setSelectedClaims((current) =>
      current.includes(claim) ? current.filter((item) => item !== claim) : [...current, claim]
    );
  };

  if (!claims.length) {
    return (
      <div className="claim-splitter">
        <button type="button" className="claim-splitter__split" onClick={handleSplit} disabled={isSplitting}>
          {isSplitting ? 'Đang tách claim...' : '✂️ Tách thành nhiều claim'}
        </button>
        {splitError && (
          <div className="claim-splitter__error">
            <AlertTriangle size={15} /> {splitError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="claim-splitter claim-splitter--expanded">
      <div className="claim-splitter__header">
        <strong>Claims đã tách</strong>
        <button type="button" className="claim-splitter__reset" onClick={clearClaims}>
          Tách lại
        </button>
      </div>

      <div className="claim-splitter__list">
        {claims.map((claim, index) => (
          <label key={`${claim}-${index}`} className="claim-splitter__item">
            <input
              type="checkbox"
              checked={selectedClaims.includes(claim)}
              onChange={() => toggleClaim(claim)}
            />
            <span>{claim}</span>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onSelectClaim(claim);
              }}
            >
              Check claim này
            </button>
          </label>
        ))}
      </div>

      <button
        type="button"
        className="claim-splitter__check-all"
        disabled={!selectedClaims.length}
        onClick={() => onCheckAll(selectedClaims)}
      >
        ✓ Check tất cả claim đã chọn
      </button>
    </div>
  );
}
