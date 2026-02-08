import { uploadHtmlToArweave, type UploadResult } from './uploadProfile';

export interface EditProfileValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate that the current wallet is allowed to edit this profile.
 *
 * Checks:
 * 1. Wallet extension is present
 * 2. Wallet is connected with SIGN_TRANSACTION permission
 * 3. Active wallet address matches the Owner tag on the profile tx
 */
export async function validateEditPermission(
  profileOwner: string | undefined
): Promise<EditProfileValidation> {
  if (!profileOwner) {
    return { valid: false, error: 'Profile has no owner information.' };
  }

  if (!window.arweaveWallet) {
    return { valid: false, error: 'Wallet not connected. Please connect your Wander wallet.' };
  }

  let permissions: string[];
  try {
    permissions = await window.arweaveWallet.getPermissions();
  } catch {
    return { valid: false, error: 'Could not read wallet permissions.' };
  }

  if (!permissions.includes('ACCESS_ADDRESS')) {
    return { valid: false, error: 'Wallet missing ACCESS_ADDRESS permission. Please reconnect.' };
  }

  if (!permissions.includes('SIGN_TRANSACTION')) {
    return { valid: false, error: 'Wallet missing SIGN_TRANSACTION permission. Please reconnect.' };
  }

  let activeAddress: string;
  try {
    activeAddress = await window.arweaveWallet.getActiveAddress();
  } catch {
    return { valid: false, error: 'Could not read wallet address.' };
  }

  if (!activeAddress) {
    return { valid: false, error: 'No active wallet address found.' };
  }

  if (activeAddress !== profileOwner) {
    return {
      valid: false,
      error: 'You are not the owner of this profile. Connected wallet does not match.',
    };
  }

  return { valid: true };
}

/**
 * Edit (re-deploy) a profile on Arweave.
 *
 * Flow:
 * 1. Validate ownership (wallet address === Owner tag)
 * 2. Upload new HTML via uploadHtmlToArweave with a fresh Version timestamp
 *
 * The new tx will have a higher Version tag, so fetchProfile will pick it up
 * as the latest version.
 */
export async function editProfile(
  html: string,
  username: string,
  profileOwner: string | undefined
): Promise<UploadResult> {
  // 1. Validate
  const validation = await validateEditPermission(profileOwner);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // 2. Re-upload (uploadHtmlToArweave sets Version to Date.now())
  return uploadHtmlToArweave(html, username);
}
