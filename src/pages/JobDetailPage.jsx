// src/pages/JobDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Tabs,
  Tab,
  Card,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { getJob } from "../services/job.service";
import JobOverview from "../components/jobOverview";
import JobApplicationForm from "../components/JobApplicationSection";
import JobCandidatesList from "../components/JobCandidatesList";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reduxJobs = useSelector((state) => state.jobs.list);
  const user = useSelector((state) => state.auth.user);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  console.log("Selected job:", job);
  const reduxJob = useMemo(
    () => reduxJobs.find((item) => String(item.id) === String(id)),
    [id, reduxJobs]
  );

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);

      if (reduxJob) setJob(reduxJob);

      const firestoreJob = await getJob(id);
      setJob(firestoreJob || reduxJob || null);

      setLoading(false);
    };

    loadJob();
  }, [id, reduxJob]);

  if (loading || !job) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">Loading job…</Typography>
      </Box>
    );
  }

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  return (
    <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 1500 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/jobs")}
          sx={{ mb: 2 }}
        >
          Back to all jobs
        </Button>

        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {job.title}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            {job.jobInfo?.locationType && (
              <Chip label={job.jobInfo.locationType} variant="outlined" />
            )}
            <Chip label={job.type} variant="outlined" />
          </Stack>

          <Typography sx={{ mt: 1, color: "#475569" }}>
            {job.location}
          </Typography>
        </Box>

        {/* TABS */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{
            borderBottom: "1px solid #e2e8f0",
            mb: 3,
            "& .MuiTab-root": { fontWeight: 600 },
          }}
        >
          <Tab label="OVERVIEW" value="overview" />
          {(!user.role === "admin" || !user.role === "super-admin") && (
            <Tab label="APPLICATION" value="application" />
          )}
          {/* ⭐ FIXED: Add missing tab */}
          {isAdmin && <Tab label="CANDIDATES" value="candidates" />}
        </Tabs>

        {/* CONTENT */}
        <Card sx={{ p: 3, borderRadius: 3 }}>
          {tab === "overview" && (
            <Box>
              <JobOverview job={job} isAdmin={isAdmin} />
              {!isAdmin && (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setTab("application")}
                  >
                    Apply Now
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {(!user.role === "admin" || !user.role === "super-admin") &&
            tab === "application" && (
              <JobApplicationForm job={job} isAdmin={isAdmin} />
            )}

          {tab === "candidates" && isAdmin && (
            <JobCandidatesList jobId={job.id} />
          )}
        </Card>
      </Box>
    </Box>
  );
}
