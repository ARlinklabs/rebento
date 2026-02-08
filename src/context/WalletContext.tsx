import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { WanderConnect } from '@wanderapp/connect';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const wanderRef = useRef<WanderConnect | null>(null);
  const pendingConnectRef = useRef(false);

  // Check if wallet is already connected (e.g., from previous session)
  const checkExistingConnection = async (retries = 5): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      if (window.arweaveWallet) {
        try {
          const permissions = await window.arweaveWallet.getPermissions();
          if (permissions.length > 0) {
            const addr = await window.arweaveWallet.getActiveAddress();
            console.log('Wallet already connected:', addr);
            setAddress(addr);
            setIsConnected(true);
            setIsInitialized(true);
            return true;
          }
          // Wallet exists but no permissions
          setIsInitialized(true);
          return false;
        } catch (err) {
          console.log('Error checking wallet:', err);
        }
      }
      // Wait 200ms before retrying
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsInitialized(true);
    return false;
  };

  // Initialize WanderConnect once on mount
  useEffect(() => {
    if (wanderRef.current) return;

    const wander = new WanderConnect({
      clientId: 'FREE_TRIAL',
    });
    wanderRef.current = wander;

    // Handler for wallet load event
    const handleWalletLoaded = async (e: CustomEvent) => {
      try {
        const { permissions = [] } = e.detail || {};

        // Check if already has permissions (already connected)
        if (permissions.length > 0) {
          const addr = await window.arweaveWallet.getActiveAddress();
          console.log('Wallet connected via event:', addr);
          setAddress(addr);
          setIsConnected(true);
          setIsInitialized(true);
          return;
        }

        setIsInitialized(true);

        // If there's a pending connect request, initiate it now
        if (pendingConnectRef.current) {
          pendingConnectRef.current = false;
          await initiateConnect();
        }
      } catch (err: any) {
        console.error('Wallet load error:', err);
        setIsInitialized(true);
      }
    };

    window.addEventListener('arweaveWalletLoaded', handleWalletLoaded as EventListener);

    // Also check if wallet is already available (in case event already fired)
    checkExistingConnection();

    return () => {
      window.removeEventListener('arweaveWalletLoaded', handleWalletLoaded as EventListener);
    };
  }, []);

  const initiateConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);

      const addr = await window.arweaveWallet.getActiveAddress();
      console.log('Connected to wallet:', addr);
      setAddress(addr);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err?.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const connect = useCallback(async () => {
    // Already connected
    if (isConnected && address) {
      console.log('Already connected:', address);
      return;
    }

    // Wander not initialized yet, queue the connect request
    if (!isInitialized) {
      pendingConnectRef.current = true;
      setIsConnecting(true);
      return;
    }

    await initiateConnect();
  }, [isConnected, address, isInitialized]);

  const disconnect = useCallback(async () => {
    try {
      if (window.arweaveWallet) {
        await window.arweaveWallet.disconnect();
        console.log('Disconnected from wallet');
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setIsConnected(false);
      setAddress(null);
      setError(null);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
