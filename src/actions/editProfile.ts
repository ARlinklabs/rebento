import { uploadHtmlToArweave, type UploadResult } from './uploadProfile';

export interface EditProfileValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate that the current user is allowed to edit this profile.
 */
export function validateEditPermission(
  walletAddress: string | undefined,
  profileOwner: string | undefined
): EditProfileValidation {
  if (!profileOwner) {
    return { valid: false, error: 'Profile has no owner information.' };
  }
  if (!walletAddress) {
    return { valid: false, error: 'Not authenticated. Please sign in first.' };
  }
  if (walletAddress !== profileOwner) {
    return {
      valid: false,
      error: 'You are not the owner of this profile. Your wallet address does not match.',
    };
  }
  return { valid: true };
}

/**
 * Edit (re-deploy) a profile on Arweave.
 */
export async function editProfile(
  html: string,
  username: string,
  profileOwner: string | undefined,
  walletAddress: string | undefined,
  client: { dispatch: (opts: any) => Promise<any> }
): Promise<UploadResult> {
  const validation = validateEditPermission(walletAddress, profileOwner);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  return uploadHtmlToArweave(html, username, client, walletAddress!);
}
