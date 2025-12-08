import * as functions from "firebase-functions";
import admin from "firebase-admin";
import cors from "cors";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();
const corsHandler = cors({ origin: true });

// HTTP callable for admin to create users
export const createUserByAdmin = functions.https.onRequest(
  (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method not allowed" });
      }

      const data = req.body;

      if (!data || !data.email || !data.password) {
        return res.status(400).send({ error: "Request body is missing data." });
      }

      try {
        // Here, you can also check auth token if you send one
        const newUser = await auth.createUser({
          email: data.email,
          password: data.password,
        });

        await db.doc(`users/${newUser.uid}`).set({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          department: data.department,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).send({ uid: newUser.uid });
      } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
      }
    });
  }
);
