import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Chip, Divider, Stack, Typography, Tabs, Tab, TextField, MenuItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PlaceIcon from "@mui/icons-material/Place";
import CategoryIcon from "@mui/icons-material/Category";
import { updateJobStatus, updateJobFormFields } from "../store/jobsSlice";
import { addLog } from "../store/logsSlice";
import { formFieldTypes } from "../constants/formFieldTypes";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jobs = useSelector((state) => state.jobs.list);
  const user = useSelector((state) => state.auth.user);
  const [tab, setTab] = useState("details");

  const job = useMemo(() => jobs.find((item) => String(item.id) === String(id)), [id, jobs]);
  const [editableFields, setEditableFields] = useState(() => job?.formFields || []);

  if (!job) {
    return (
      <Box sx={{ mt: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/jobs")}>
          Back to jobs
        </Button>
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
          Job not found
        </Typography>
        <Typography sx={{ color: "#475569" }}>This posting may have been moved or removed.</Typography>
      </Box>
    );
  }

  const handleStatusChange = (nextStatus) => {
    dispatch(updateJobStatus({ id: job.id, status: nextStatus }));
    dispatch(
      addLog({
        actor: { name: user?.name || "User", email: user?.email || "" },
        entityId: job.id,
        entityName: job.title,
        entityType: "job",
        actionLabel: nextStatus === "live" ? "published job" : "marked job as draft",
      })
    );
  };

  const handleFieldChange = (index, key, value) => {
    setEditableFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleAddField = () => {
    setEditableFields((prev) => [...prev, { label: "", required: false, inputType: "text" }]);
  };

  const handleSaveFields = () => {
    dispatch(
      updateJobFormFields({
        id: job.id,
        formFields: editableFields.filter((field) => field.label.trim()),
      })
    );
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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/jobs")} sx={{ mb: 2 }}>
        Back to all jobs
      </Button>

      <Stack spacing={1}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          {job.title}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip icon={<CategoryIcon />} label={job.department} variant="outlined" />
          <Chip icon={<WorkOutlineIcon />} label={job.type} variant="outlined" />
          <Chip icon={<PlaceIcon />} label={job.location} variant="outlined" />
          <StatusChip status={job.status} />
        </Stack>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
          {job.posted}
        </Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {user && (user.role === "admin" || user.role === "super-admin") ? (
        <>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mt: 1, borderBottom: "1px solid #e5e7eb" }}>
            <Tab label="Job details" value="details" />
            <Tab label="Form fields" value="form" />
          </Tabs>
          {tab === "details" && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>{job.description}</Typography>
              <Typography sx={{ color: "#475569", lineHeight: 1.7 }}>
                We value builders who are customer-obsessed, collaborative, and comfortable shipping iteratively. If this sounds
                like you, we would love to hear from you.
              </Typography>
              <Button variant="outlined" size="large" onClick={() => navigate("/jobs")}>
                Back to jobs
              </Button>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                {job.status !== "live" && (
                  <Button variant="contained" color="primary" onClick={() => handleStatusChange("live")}>
                    Publish job
                  </Button>
                )}
                {job.status !== "draft" && (
                  <Button variant="outlined" onClick={() => handleStatusChange("draft")}>
                    Mark as draft
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
          {tab === "form" && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              {editableFields.map((field, index) => (
                <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                  <TextField
                    label="Field label"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Input type"
                    select
                    value={field.inputType}
                    onChange={(e) => handleFieldChange(index, "inputType", e.target.value)}
                    sx={{ width: { xs: "100%", sm: 200 } }}
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
                    onChange={(e) => handleFieldChange(index, "required", e.target.value === "required")}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                  >
                    <MenuItem value="required">Required</MenuItem>
                    <MenuItem value="optional">Optional</MenuItem>
                  </TextField>
                </Stack>
              ))}
              <Button variant="text" onClick={handleAddField} sx={{ alignSelf: "flex-start" }}>
                Add field
              </Button>
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" onClick={handleSaveFields}>
                  Save form fields
                </Button>
                <Button variant="text" onClick={() => setEditableFields(job.formFields || [])}>
                  Reset
                </Button>
              </Stack>
            </Stack>
          )}
        </>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography sx={{ color: "#334155", lineHeight: 1.7 }}>{job.description}</Typography>
          <Typography sx={{ color: "#475569", lineHeight: 1.7 }}>
            We value builders who are customer-obsessed, collaborative, and comfortable shipping iteratively. If this sounds
            like you, we would love to hear from you.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate(`/jobs/${job.id}/apply`)}>
            Apply now
          </Button>
        </Stack>
      )}
    </Box>
  );
}

function StatusChip({ status }) {
  const color = status === "live" ? "success" : "default";
  const label = status === "live" ? "Live" : "Draft";
  return <Chip label={label} color={color} variant="outlined" />;
}
