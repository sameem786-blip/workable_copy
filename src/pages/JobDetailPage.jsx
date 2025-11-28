import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PlaceIcon from "@mui/icons-material/Place";
import CategoryIcon from "@mui/icons-material/Category";

import { updateJobStatus, updateJobFormFields } from "../store/jobsSlice";
import { addLog } from "../store/logsSlice";
import { formFieldTypes } from "../constants/formFieldTypes";
import { getJob, updateJob } from "../services/job.service";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxJobs = useSelector((state) => state.jobs.list);
  const user = useSelector((state) => state.auth.user);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("details");

  // fallback job from Redux (if exists)
  const reduxJob = useMemo(
    () => reduxJobs.find((item) => String(item.id) === String(id)),
    [id, reduxJobs]
  );

  // Load job from Firestore
  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);

      // Use Redux job first to prevent blank flash
      if (reduxJob) setJob(reduxJob);

      // Then fetch latest from Firestore
      const firestoreJob = await getJob(id);

      setJob(firestoreJob || reduxJob || null);
      setLoading(false);
    };

    loadJob();
  }, [id, reduxJob]);

  const [editableFields, setEditableFields] = useState([]);

  // Update editable fields when job loads
  useEffect(() => {
    if (job?.formFields) {
      setEditableFields(job.formFields);
    }
  }, [job]);

  // Loading state
  if (loading || !job) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Loading job...</Typography>
      </Box>
    );
  }

  const handleStatusChange = async (nextStatus) => {
    try {
      // 1️⃣ Update Firestore
      await updateJob(job.id, {
        status: nextStatus,
        updatedAt: Date.now(),
      });

      // 2️⃣ Update Redux
      dispatch(updateJobStatus({ id: job.id, status: nextStatus }));

      // 3️⃣ Add log locally
      dispatch(
        addLog({
          actor: { name: user?.name || "User", email: user?.email || "" },
          entityId: job.id,
          entityName: job.title,
          entityType: "job",
          actionLabel:
            nextStatus === "live" ? "published job" : "marked job as draft",
        })
      );

      // 4️⃣ Save log in Firestore
      await addLog({
        actor: { name: user?.name || "User", email: user?.email || "" },
        entityId: job.id,
        entityName: job.title,
        entityType: "job",
        actionLabel:
          nextStatus === "live" ? "published job" : "marked job as draft",
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Failed to update job status", err);
      alert("Failed to change job status. Try again.");
    }
  };

  const handleFieldChange = (index, key, value) => {
    setEditableFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleAddField = () => {
    setEditableFields((prev) => [
      ...prev,
      { label: "", required: false, inputType: "text" },
    ]);
  };

  const handleSaveFields = () => {
    const cleanedFields = editableFields.filter((field) => field.label.trim());

    dispatch(updateJobFormFields({ id: job.id, formFields: cleanedFields }));

    dispatch(
      addLog({
        actor: { name: user?.name || "User", email: user?.email || "" },
        entityId: job.id,
        entityName: job.title,
        entityType: "job",
        actionLabel: "updated form fields",
      })
    );
  };

  return (
    <Box sx={{ mt: 2, mb: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/jobs")}
        sx={{ mb: 2 }}
      >
        Back to all jobs
      </Button>

      <Stack spacing={1}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          {job.title}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={<CategoryIcon />}
            label={job.department}
            variant="outlined"
          />
          <Chip
            icon={<WorkOutlineIcon />}
            label={job.type}
            variant="outlined"
          />
          <Chip icon={<PlaceIcon />} label={job.location} variant="outlined" />
          <StatusChip status={job.status} />
        </Stack>

        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
          {job.posted}
        </Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Admin Controls */}
      {user && (user.role === "admin" || user.role === "super-admin") ? (
        <>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{ mt: 1, borderBottom: "1px solid #e5e7eb" }}
          >
            <Tab label="Job details" value="details" />
            <Tab label="Form fields" value="form" />
          </Tabs>

          {/* DETAILS TAB */}
          {tab === "details" && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>
                {job.description}
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                {job.status !== "live" && (
                  <Button
                    variant="contained"
                    onClick={() => handleStatusChange("live")}
                  >
                    Publish job
                  </Button>
                )}
                {job.status !== "draft" && (
                  <Button
                    variant="outlined"
                    onClick={() => handleStatusChange("draft")}
                  >
                    Mark as draft
                  </Button>
                )}
              </Stack>
            </Stack>
          )}

          {/* FORM FIELDS TAB */}
          {tab === "form" && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              {editableFields.map((field, index) => (
                <Stack
                  key={index}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                >
                  <TextField
                    label="Field label"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldChange(index, "label", e.target.value)
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Input type"
                    select
                    value={field.inputType}
                    onChange={(e) =>
                      handleFieldChange(index, "inputType", e.target.value)
                    }
                    sx={{ width: 200 }}
                  >
                    {formFieldTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Required"
                    select
                    value={field.required ? "required" : "optional"}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "required",
                        e.target.value === "required"
                      )
                    }
                    sx={{ width: 200 }}
                  >
                    <MenuItem value="required">Required</MenuItem>
                    <MenuItem value="optional">Optional</MenuItem>
                  </TextField>
                </Stack>
              ))}

              <Button variant="text" onClick={handleAddField}>
                Add field
              </Button>

              <Button variant="contained" onClick={handleSaveFields}>
                Save form fields
              </Button>
            </Stack>
          )}
        </>
      ) : (
        <>
          {/* Non-admin view */}
          <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>
            {job.description}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
          >
            Apply now
          </Button>
        </>
      )}
    </Box>
  );
}

function StatusChip({ status }) {
  const color = status === "live" ? "success" : "default";
  return (
    <Chip
      label={status === "live" ? "Live" : "Draft"}
      color={color}
      variant="outlined"
    />
  );
}
