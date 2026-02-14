export const getPiSandboxMode = (): boolean => {
  // Force mainnet for production stability.
  return false;
};

export const getPiModeLabel = (): 'mainnet' | 'sandbox/testnet' => {
  return getPiSandboxMode() ? 'sandbox/testnet' : 'mainnet';
};
