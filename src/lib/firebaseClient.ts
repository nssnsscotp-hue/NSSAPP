import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
// Inside a full-stack container environment, always specify firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Enable connectivity check on warm boot
async function verifyFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test_connectivity_check', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or networks status.");
    }
  }
}
verifyFirebaseConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Fetches the avatar URL for a given username.
 */
export async function getProfilePhoto(username: string): Promise<string | null> {
  if (!username) return null;
  const pathStr = `profiles/${username.toLowerCase()}`;
  try {
    const docRef = doc(db, 'profiles', username.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().avatar_url || null;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, pathStr);
  }
}

/**
 * Saves or updates the avatar URL for a given username in Firestore.
 */
export async function saveProfilePhoto(username: string, avatarUrl: string): Promise<void> {
  if (!username) return;
  const pathStr = `profiles/${username.toLowerCase()}`;
  try {
    const docRef = doc(db, 'profiles', username.toLowerCase());
    await setDoc(docRef, {
      username: username,
      avatar_url: avatarUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}
