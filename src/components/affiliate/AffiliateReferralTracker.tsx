import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveAffiliateReferral } from '../../utils/affiliateReferral';

export default function AffiliateReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      saveAffiliateReferral(ref);
    }
  }, [location.search]);

  return null;
}
