// backend/src/services/db.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    // 環境に応じて credential を設定
    credential: admin.credential.applicationDefault(),
    // または serviceAccount を使う:
    // credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)),
  });
}

export const db = admin.firestore();
