// /src/lib/firebase-admin.ts
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

let adminApp: App;

const firebaseConfig = {
  projectId: "digitarcenter-nuevo",
};

if (!getApps().length) {
  // En un entorno de Google Cloud (como Firebase Hosting, Cloud Functions, o este entorno de desarrollo),
  // inicializar con el projectId asegura que el SDK encuentre las credenciales correctas del entorno.
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  adminApp = getApps()[0];
}

export const db = getFirestore(adminApp);
export const auth = getAuth(adminApp);
export const messaging = getMessaging(adminApp);
