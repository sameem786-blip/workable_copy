import {
  Box,
  Card,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import EmailIcon from "@mui/icons-material/Email";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BlockIcon from "@mui/icons-material/Block";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";

import {
  updateCandidateStage,
  addCandidateComment,
  rejectCandidate,
  sendEmailToCandidate,
} from "../services/candidate.service";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const candidates = useSelector((state) => state.candidates.list);

  // ---------------------
  // State hooks
  // ---------------------
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [anchorEl, setAnchorEl] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const stages = [
    "Applied",
    "Shortlisted",
    "Interview",
    "Offer",
    "Hired",
    "Rejected",
  ];

  // ---------------------
  // Fetch candidate
  // ---------------------
  useEffect(() => {
    const candidateFromStore = candidates.find(
      (c) => String(c.id) === String(id)
    );
    if (candidateFromStore) {
      setSelected(candidateFromStore);
      setLoading(false);
    } else {
      const fetchCandidate = async () => {
        try {
          const docRef = doc(db, "candidates", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSelected({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching candidate:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCandidate();
    }
  }, [id, candidates]);

  const handleStageUpdate = async (stage) => {
    if (!selected) return;
    try {
      await updateCandidateStage(selected.id, stage);
      const newLog = {
        type: "stage_change",
        stage,
        admin: user.name || "Admin",
        date: new Date().toISOString(),
      };
      const candidateRef = doc(db, "candidates", selected.id);
      await updateDoc(candidateRef, { timeline: arrayUnion(newLog), stage });
      setSelected((prev) => ({
        ...prev,
        stage,
        timeline: [...(prev.timeline || []), newLog],
      }));
      showSnackbar(`Stage updated to "${stage}"`);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update stage", "error");
    } finally {
      setAnchorEl(null);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selected) return;
    try {
      const newCommentLog = {
        type: "comment",
        text: commentText,
        admin: user.name || "Admin",
        date: new Date().toISOString(),
      };
      await addCandidateComment(selected.id, commentText, user.name || "Admin");
      const candidateRef = doc(db, "candidates", selected.id);
      await updateDoc(candidateRef, {
        comments: arrayUnion(newCommentLog),
        timeline: arrayUnion(newCommentLog),
      });
      setSelected((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newCommentLog],
        timeline: [...(prev.timeline || []), newCommentLog],
      }));
      showSnackbar("Comment added");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to add comment", "error");
    } finally {
      setCommentText("");
      setCommentOpen(false);
    }
  };

  const handleRejectCandidate = async () => {
    if (!rejectReason.trim() || !selected) return;
    try {
      await rejectCandidate(selected.id, rejectReason, user.name || "Admin");
      const rejectLog = {
        type: "reject",
        reason: rejectReason,
        admin: user.name || "Admin",
        date: new Date().toISOString(),
      };
      const candidateRef = doc(db, "candidates", selected.id);
      await updateDoc(candidateRef, {
        status: "rejected",
        rejectionReason: rejectReason,
        rejectedBy: user.name || "Admin",
        rejectedAt: serverTimestamp(),
        timeline: arrayUnion(rejectLog),
      });
      setSelected((prev) => ({
        ...prev,
        status: "rejected",
        rejectionReason: rejectReason,
        rejectedBy: user.name || "Admin",
        timeline: [...(prev.timeline || []), rejectLog],
      }));
      showSnackbar("Candidate rejected", "warning");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to reject candidate", "error");
    } finally {
      setRejectReason("");
      setRejectOpen(false);
    }
  };

  const handleUndoRejection = async () => {
    if (!selected) return;
    try {
      const candidateRef = doc(db, "candidates", selected.id);
      await updateDoc(candidateRef, {
        status: "active",
        rejectionReason: null,
        rejectedBy: null,
        rejectedAt: null,
      });
      const newLog = {
        type: "undo_reject",
        admin: user.name || "Admin",
        date: new Date().toISOString(),
      };
      await updateDoc(candidateRef, { timeline: arrayUnion(newLog) });
      setSelected((prev) => ({
        ...prev,
        status: "active",
        rejectionReason: null,
        rejectedBy: null,
        rejectedAt: null,
        timeline: [...(prev.timeline || []), newLog],
      }));
      showSnackbar("Rejection undone");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to undo rejection", "error");
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || !selected) return;
    try {
      await sendEmailToCandidate(
        selected.email,
        emailSubject,
        emailBody,
        selected.id,
        user.name || "Admin"
      );
      const newEmailLog = {
        type: "email",
        subject: emailSubject,
        body: emailBody,
        admin: user.name || "Admin",
        date: new Date().toISOString(),
      };
      const candidateRef = doc(db, "candidates", selected.id);
      await updateDoc(candidateRef, { timeline: arrayUnion(newEmailLog) });
      setSelected((prev) => ({
        ...prev,
        timeline: [...(prev.timeline || []), newEmailLog],
      }));
      showSnackbar("Email sent");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to send email", "error");
    } finally {
      setEmailSubject("");
      setEmailBody("");
      setEmailOpen(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (!user || (user.role !== "admin" && user.role !== "super-admin"))
    return <Navigate to="/jobs" replace />;
  if (!selected)
    return (
      <Box sx={{ mt: 2 }}>
        <Button variant="text" onClick={() => navigate("/candidates")}>
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Candidate not found
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="text"
        onClick={() => navigate("/candidates")}
        sx={{ mb: 1 }}
      >
        Back to candidates
      </Button>

      <Card sx={{ p: 3 }}>
        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <Avatar
              src={selected.photoURL || ""}
              sx={{ width: 70, height: 70 }}
            />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {selected.name}
              </Typography>
              <Typography sx={{ color: "#64748b" }}>
                {selected.jobTitle}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "gray" }}>
                {selected.address}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={selected.status || "—"}
                  color={selected.status === "rejected" ? "error" : "primary"}
                />
                <Chip label={selected.stage || "Applied"} color="primary" />
              </Stack>
            </Box>
          </Stack>

          <Box>
            <Button
              variant="contained"
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Move to {selected.stage}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {stages.map((stage) => (
                <MenuItem key={stage} onClick={() => handleStageUpdate(stage)}>
                  {stage}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Stack>

        {/* ACTIONS */}
        <Box
          sx={{
            mt: 3,
            mb: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Tooltip title="Send Email">
              <IconButton onClick={() => setEmailOpen(true)}>
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Comment">
              <IconButton onClick={() => setCommentOpen(true)}>
                <ChatBubbleOutlineIcon />
              </IconButton>
            </Tooltip>
            {selected.status !== "rejected" ? (
              <Tooltip title="Reject Candidate">
                <IconButton color="error" onClick={() => setRejectOpen(true)}>
                  <BlockIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Undo Rejection">
                <IconButton color="success" onClick={handleUndoRejection}>
                  <Typography>Undo</Typography>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* TABS */}
        <Box sx={{ mt: 4, borderBottom: "1px solid #ddd" }}>
          <Stack direction="row" spacing={4}>
            {["profile", "timeline", "comments"].map((tab) => (
              <Button
                key={tab}
                variant="text"
                onClick={() => setActiveTab(tab)}
                sx={{
                  borderBottom:
                    activeTab === tab ? "3px solid #1a73e8" : "none",
                  color: activeTab === tab ? "#1a73e8" : "gray",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <Box sx={{ mt: 4 }}>
            <Typography fontWeight={700} mb={1}>
              Contact Information
            </Typography>
            <Stack spacing={1}>
              <Typography>Email: {selected.email}</Typography>
              <Typography>Phone: {selected.contact}</Typography>
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Typography fontWeight={700} mb={1}>
              Resume
            </Typography>
            {selected.resume ? (
              <a href={selected.resume} target="_blank">
                View Resume
              </a>
            ) : (
              <Typography>No resume uploaded</Typography>
            )}
            <Divider sx={{ my: 3 }} />
            <Typography fontWeight={700} mb={2}>
              Summary
            </Typography>
            <Typography>{selected.profileSummary || "—"}</Typography>
          </Box>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <Box sx={{ mt: 4 }}>
            <Typography fontWeight={700} mb={2}>
              Timeline
            </Typography>
            {(selected.timeline || []).map((item, index) => (
              <Paper
                key={index}
                sx={{ p: 2, mb: 2, borderRadius: 2, display: "flex", gap: 2 }}
              >
                {item.type === "email" ? (
                  <EmailIcon sx={{ color: "#1a73e8", mt: 0.5 }} />
                ) : (
                  <Chip
                    label={
                      item.type === "comment"
                        ? "Comment"
                        : item.type === "undo_reject"
                        ? "Undo Reject"
                        : "Stage Change"
                    }
                    size="small"
                  />
                )}
                <Box>
                  <Typography fontWeight={600}>
                    {item.type === "email"
                      ? item.subject
                      : item.type === "comment"
                      ? "Comment"
                      : item.type === "undo_reject"
                      ? "Undo Rejection"
                      : `Moved to ${item.stage}`}
                  </Typography>
                  {item.text && (
                    <Typography sx={{ mt: 1 }}>{item.text}</Typography>
                  )}
                  {item.body && (
                    <Typography sx={{ mt: 1 }}>{item.body}</Typography>
                  )}
                  <Typography sx={{ fontSize: 12, color: "gray", mt: 1 }}>
                    {item.admin} • {new Date(item.date).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* COMMENTS TAB */}
        {activeTab === "comments" && (
          <Box sx={{ mt: 4 }}>
            <Typography fontWeight={700} mb={2}>
              Admin Comments
            </Typography>
            {(selected.comments || []).map((c, i) => (
              <Paper key={i} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography>{c.text}</Typography>
                <Typography sx={{ fontSize: 12, color: "gray", mt: 1 }}>
                  {new Date(c.date).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Card>

      {/* EMAIL MODAL */}
      <Dialog open={emailOpen} onClose={() => setEmailOpen(false)}>
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            sx={{ mb: 2 }}
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Body"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailOpen(false)}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* COMMENT MODAL */}
      <Dialog open={commentOpen} onClose={() => setCommentOpen(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentOpen(false)}>Cancel</Button>
          <Button onClick={handleAddComment} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <DialogTitle>Reject Candidate</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={handleRejectCandidate}
            variant="contained"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
