import { useState, useEffect } from 'react';
import { useAuth } from 'arlinkauth/react';
import { fetchProfileFromArweave } from '@/actions/fetchProfile';

export function useDeployedProfile() {
  const { user, isAuthenticated } = useAuth();
  const [hasDeployedProfile, setHasDeployedProfile] = useState(false);
  const [deployedUsername, setDeployedUsername] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.arweave_address) {
      setHasDeployedProfile(false);
      setDeployedUsername(null);
      return;
    }

    const checkProfile = async () => {
      setIsChecking(true);
      const name = (user.name || '').toLowerCase().replace(/\s+/g, '').replace(/^@/, '');
      if (!name) {
        setIsChecking(false);
        return;
      }

      const result = await fetchProfileFromArweave(name);
      if (result.success && result.owner === user.arweave_address) {
        setHasDeployedProfile(true);
        setDeployedUsername(result.username || name);
      }
      setIsChecking(false);
    };

    checkProfile();
  }, [isAuthenticated, user]);

  return { hasDeployedProfile, deployedUsername, isChecking };
}
