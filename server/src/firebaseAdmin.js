import admin from "firebase-admin";
import { config } from "./config.js";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export { admin };

db.settings({ ignoreUndefinedProperties: true });
