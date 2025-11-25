import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { addCandidate } from "../store/candidatesSlice";
import { addLog } from "../store/logsSlice";

export default function ApplyJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jobs = useSelector((state) => state.jobs.list);
  const user = useSelector((state) => state.auth.user);
  const job = useMemo(() => jobs.find((item) => String(item.id) === String(id)), [id, jobs]);

  const [applicant, setApplicant] = useState({ firstName: "", lastName: "", email: "", contact: "", resume: "" });
  const [responses, setResponses] = useState(() =>
    job?.formFields?.map((field) => ({ ...field, value: "" })) || []
  );

  if (user || !job || job.status !== "live") {
    return <Navigate to="/jobs" replace />;
  }

  const handleFieldChange = (index, value) => {
    setResponses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const action = addCandidate({
      jobId: job.id,
      jobTitle: job.title,
      name: `${applicant.firstName} ${applicant.lastName}`.trim(),
      email: applicant.email,
      contact: applicant.contact,
      resume: applicant.resume,
      answers: responses.map(({ label, inputType, required, value }) => ({
        label,
        inputType,
        required,
        value,
      })),
    });
    dispatch(action);
    dispatch(
      addLog({
        actor: { name: `${applicant.firstName} ${applicant.lastName}`.trim() || "Applicant", email: applicant.email },
        entityId: action.payload.id,
        entityName: `${applicant.firstName} ${applicant.lastName}`.trim() || applicant.email,
        entityType: "candidate",
        actionLabel: "applied to job",
      })
    );
    navigate("/jobs");
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 4 }}>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          background: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Apply for {job.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Fill out the form to apply. Required fields are marked.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First name"
                required
                value={applicant.firstName}
                onChange={(e) => setApplicant((prev) => ({ ...prev, firstName: e.target.value }))}
              />
              <TextField
                label="Last name"
                required
                value={applicant.lastName}
                onChange={(e) => setApplicant((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </Stack>
            <TextField
              label="Email"
              required
              type="email"
              value={applicant.email}
              onChange={(e) => setApplicant((prev) => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label="Contact number"
              required
              type="tel"
              value={applicant.contact}
              onChange={(e) => setApplicant((prev) => ({ ...prev, contact: e.target.value }))}
            />
            <TextField
              label="Resume"
              required
              type="file"
              value={undefined}
              onChange={(e) => setApplicant((prev) => ({ ...prev, resume: e.target.files?.[0]?.name || "" }))}
              helperText={applicant.resume || "Upload resume"}
            />
            {responses.map((field, index) => (
              <FieldInput key={index} field={field} onChange={(value) => handleFieldChange(index, value)} />
            ))}
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained">
                Submit application
              </Button>
              <Button variant="text" onClick={() => navigate(`/jobs/${job.id}`)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function FieldInput({ field, onChange }) {
  const commonProps = {
    fullWidth: true,
    required: field.required,
    label: field.label,
    value: field.value || "",
    onChange: (e) => onChange(e.target.value),
  };

  switch (field.inputType) {
    case "textarea":
      return <TextField {...commonProps} multiline minRows={3} />;
    case "rich-text":
      return <TextField {...commonProps} multiline minRows={5} placeholder="Rich text" />;
    case "url":
      return <TextField {...commonProps} type="url" />;
    case "number":
      return <TextField {...commonProps} type="number" />;
    case "file":
      return (
        <TextField
          {...commonProps}
          type="file"
          value={undefined}
          onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
          helperText={field.value || "Upload file"}
        />
      );
    default:
      return <TextField {...commonProps} />;
  }
}
