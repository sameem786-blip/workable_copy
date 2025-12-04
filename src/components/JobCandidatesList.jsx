import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Divider,
  Card,
  Stack,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Paper,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BlockIcon from "@mui/icons-material/Block";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import {
  updateCandidateStage,
  addCandidateComment,
  rejectCandidate,
  getCandidatesByJob,
  sendEmailToCandidate,
} from "../services/candidate.service";
import { useSelector } from "react-redux";

export default function JobCandidatesList({ jobId }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  // Stage menu
  const [anchorEl, setAnchorEl] = useState(null);

  // Email modal
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Comment modal
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const stages = [
    "Applied",
    "Qualified",
    "Phone Screen",
    "Testing",
    "Interview",
    "Hired",
    "Rejected",
  ];

  const formatExperience = (exp) => {
    if (!exp || typeof exp !== "object") return "No experience info";

    return `${exp.title || ""}${exp.company ? ` at ${exp.company}` : ""}${
      exp.startDate || exp.endDate
        ? ` (${exp.startDate || "N/A"} - ${
            exp.current ? "Present" : exp.endDate || "N/A"
          })`
        : ""
    }`;
  };

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      const data = await getCandidatesByJob(jobId);
      setCandidates(data || []);
      if (data?.length > 0) setSelected(data[0]);
      setLoading(false);
    };
    loadCandidates();
  }, [jobId]);

  // ========== Handlers ==========

  const handleStageUpdate = async (stage) => {
    if (!selected) return;
    await updateCandidateStage(selected.id, stage);
    setSelected((prev) => ({ ...prev, stage }));
    setAnchorEl(null);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selected) return;

    await addCandidateComment(
      selected.id,
      commentText,
      user.name || "Admin Name"
    );

    setSelected((prev) => ({
      ...prev,
      comments: [
        ...(prev.comments || []),
        {
          text: commentText,
          admin: "Admin Name",
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    setCommentText("");
    setCommentOpen(false);
  };

  const handleRejectCandidate = async () => {
    if (!rejectReason.trim() || !selected) return;

    await rejectCandidate(selected.id, rejectReason, user.name || "Admin");

    setSelected((prev) => ({
      ...prev,
      status: "rejected",
      rejectionReason: rejectReason,
    }));

    setRejectReason("");
    setRejectOpen(false);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || !selected) return;

    await sendEmailToCandidate(
      selected.email,
      emailSubject,
      emailBody,
      selected.id,
      user.name || "Admin"
    );

    setEmailSubject("");
    setEmailBody("");
    setEmailOpen(false);
  };

  if (loading) return <Typography>Loading candidates...</Typography>;
  if (candidates.length === 0)
    return <Typography>No candidates yet.</Typography>;

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* LEFT LIST */}
      <Card sx={{ width: 300, p: 2, maxHeight: 600, overflowY: "auto" }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          Applicants ({candidates.length})
        </Typography>

        <List>
          {candidates.map((c) => (
            <ListItemButton
              key={c.id}
              selected={selected?.id === c.id}
              onClick={() => setSelected(c)}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: selected?.id === c.id ? "#eef6ff" : "transparent",
              }}
            >
              <Avatar sx={{ mr: 2 }} src={c.photoFileName || ""} />
              <ListItemText
                primary={c.name}
                secondary={formatExperience(c.experience)}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Card>

      {/* RIGHT SIDE */}
      {selected && (
        <Card sx={{ flex: 1, p: 3 }}>
          {/* HEADER */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{ width: 60, height: 60 }}
              src={selected.photoFileName || ""}
            />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {selected.name}
              </Typography>
              <Chip
                label={selected.stage || "Applied"}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            {selected.status && (
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ mt: 1 }}>{selected.status}</Typography>
              </Box>
            )}
          </Box>

          {/* ACTION BAR */}
          <Box
            sx={{
              mt: 3,
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
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
              <Tooltip title="Reject Candidate">
                <IconButton color="error" onClick={() => setRejectOpen(true)}>
                  <BlockIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Stage Button */}
            <Box>
              <Button
                variant="contained"
                color="success"
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Move to {selected.stage || "Applied"}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {stages.map((stage) => (
                  <MenuItem
                    key={stage}
                    onClick={() => handleStageUpdate(stage)}
                  >
                    {stage}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* CONTACT */}
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Contact Information
          </Typography>
          <Stack spacing={1}>
            <Typography>Email: {selected.email}</Typography>
            <Typography>Phone: {selected.contact}</Typography>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* RESUME */}
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Resume</Typography>
          {selected.resume ? (
            <a href={selected.resume} target="_blank">
              View Resume
            </a>
          ) : (
            <Typography>No resume uploaded</Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* COMMENTS */}
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Admin Comments
          </Typography>
          <Stack spacing={1}>
            {(selected.comments || []).map((c, index) => (
              <Paper key={index} sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography>{c.text}</Typography>
                <Typography sx={{ fontSize: 12, color: "gray", mt: 0.5 }}>
                  {c.createdAt || c.date}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Card>
      )}

      {/* EMAIL MODAL */}
      <Dialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Body"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendEmail}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* COMMENT MODAL */}
      <Dialog
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddComment}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Candidate</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectCandidate}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
