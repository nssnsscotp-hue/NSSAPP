import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getQrSecurityKey(programId: string, programName: string, programCode: string): string {
  const salt = "NSS_OTTAPALAM_SECRET_KEY_2026_GPS_SECURED";
  const data = `${programId}:${programName}:${programCode}:${salt}`;
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + ch;
    hash1 |= 0;
    hash2 = ((hash2 << 7) + hash2) ^ ch;
    hash2 |= 0;
  }
  const p1 = Math.abs(hash1).toString(36).toUpperCase();
  const p2 = Math.abs(hash2).toString(36).toUpperCase();
  return `NSS-SECURE-QR-${p1}-${p2}`;
}
