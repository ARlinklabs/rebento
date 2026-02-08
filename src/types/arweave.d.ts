declare global {
  interface Window {
    arweaveWallet: {
      connect: (permissions: string[]) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
      getActivePublicKey: () => Promise<string>;
      getAllAddresses: () => Promise<string[]>;
      getPermissions: () => Promise<string[]>;
      sign: (transaction: any) => Promise<any>;
      signDataItem: (dataItem: {
        data: string | Uint8Array;
        target?: string;
        anchor?: string;
        tags?: Array<{ name: string; value: string }>;
      }, options?: any) => Promise<Uint8Array>;
      signMessage: (data: Uint8Array, options?: { hashAlgorithm?: string }) => Promise<Uint8Array>;
      dispatch: (transaction: any) => Promise<{ id: string; type: string }>;
    };
  }
}

export {};
