import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let appInstance: any = null;
try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase app initialization warning:', e);
}

let authObj: Auth;
let dbObj: Firestore;

try {
  authObj = appInstance ? getAuth(appInstance) : ({} as Auth);
} catch (e) {
  console.warn('Firebase getAuth warning:', e);
  authObj = {} as Auth;
}

try {
  dbObj = appInstance ? getFirestore(appInstance, firebaseConfig.firestoreDatabaseId || undefined) : ({} as Firestore);
} catch (e) {
  console.warn('Firebase getFirestore warning:', e);
  dbObj = {} as Firestore;
}

export const auth: Auth = authObj;
export const db: Firestore = dbObj;

let authInstance: Auth | null = auth;
let googleProviderInstance: GoogleAuthProvider | null = null;

export function getFirebaseAuth(): Auth | null {
  return authInstance;
}

export function getGoogleAuthProvider(): GoogleAuthProvider | null {
  if (googleProviderInstance) return googleProviderInstance;
  try {
    googleProviderInstance = new GoogleAuthProvider();
    return googleProviderInstance;
  } catch (err) {
    console.warn('GoogleAuthProvider initialization postponed/unavailable:', err);
    return null;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
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

