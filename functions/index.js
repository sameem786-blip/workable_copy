import * as functions from "firebase-functions";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import cors from "cors";

// Initialize Firebase
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const corsHandler = cors({ origin: true });

// ===========================
// CREATE USER
// ===========================
export const createUserByAdmin = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    const data = req.body;
    if (!data || !data.email || !data.password) {
      return res.status(400).send({ error: "Request body is missing data." });
    }

    try {
      const newUser = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
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
});

// ===========================
// UPDATE USER
// ===========================
export const updateUserByAdmin = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    const { uid, email, password, firstName, lastName, role, department } =
      req.body;
    if (!uid) return res.status(400).send({ error: "UID is required" });

    try {
      // Check if user exists in Auth
      let authUser;
      try {
        authUser = await auth.getUser(uid);
      } catch (err) {
        return res.status(404).send({ error: "User not found in Auth" });
      }

      // Check if email is already used by another user
      if (email) {
        const existingUser = await auth.getUserByEmail(email).catch(() => null);
        if (existingUser && existingUser.uid !== uid) {
          return res
            .status(400)
            .send({ error: "Email already in use by another user." });
        }
      }

      // Prepare update object for Auth
      const authUpdate = {};
      if (email) authUpdate.email = email;
      if (password) authUpdate.password = password;
      if (firstName || lastName)
        authUpdate.displayName = `${firstName || ""} ${lastName || ""}`.trim();

      if (Object.keys(authUpdate).length > 0) {
        await auth.updateUser(uid, authUpdate);
      }

      // Prepare update object for Firestore
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (department !== undefined) updateData.department = department;

      const userRef = db.doc(`users/${uid}`);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.update(updateData);
      } else {
        await userRef.set(updateData);
      }

      res.status(200).send({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
});

// ===========================
// DELETE USER
// ===========================
export const deleteUserByAdmin = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST")
      return res.status(405).send({ error: "Method not allowed" });

    const { uid } = req.body;
    if (!uid) return res.status(400).send({ error: "UID is required" });

    try {
      await db.doc(`users/${uid}`).delete();
      await auth.deleteUser(uid);

      res.status(200).send({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
});

// ===========================
// EMAIL FUNCTION
// ===========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bkfl1122@gmail.com",
    pass: "roaiyleygibfbtuq",
  },
});

export const sendEmailToCandidate = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send(""); // CORS preflight

    const { candidateEmail, subject, body, candidateId, adminName } = req.body;

    if (!candidateEmail || !subject || !body) {
      return res
        .status(400)
        .send("candidateEmail, subject, and body are required.");
    }

    try {
      await transporter.sendMail({
        from: "bkfl1122@gmail.com",
        to: candidateEmail,
        subject,
        html: body,
      });

      if (candidateId) {
        await db
          .collection("candidates")
          .doc(candidateId)
          .update({
            emailLogs: admin.firestore.FieldValue.arrayUnion({
              subject,
              body,
              admin: adminName,
              date: new Date().toISOString(),
            }),
          });
      }

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send({ error: error.message });
    }
  });
});
