import * as functions from "firebase-functions";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import cors from "cors";
export { createUserByAdmin } from "./createUser.js";

admin.initializeApp();

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bkfl1122@gmail.com",
    pass: "roaiyleygibfbtuq",
  },
});

const corsHandler = cors({ origin: true });

export const sendEmailToCandidate = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { candidateEmail, subject, body, candidateId, adminName } = req.body;

    if (!candidateEmail || !subject || !body) {
      return res.status(400).send("candidateEmail, subject, and body are required.");
    }

    try {
      await transporter.sendMail({
        from: "bkfl1122@gmail.com",
        to: candidateEmail,
        subject,
        html: body,
      });

      if (candidateId) {
        await db.collection("candidates").doc(candidateId).update({
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
