import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { addCandidate } from "../store/candidatesSlice";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { addLog } from "../store/logsSlice";
import { createCandidate, uploadResume } from "../services/candidate.service";

export default function ApplyJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const jobs = useSelector((state) => state.jobs.list);
  const user = useSelector((state) => state.auth.user);

  const job = useMemo(
    () => jobs.find((item) => String(item.id) === String(id)),
    [id, jobs]
  );

  const [applicant, setApplicant] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    resumeFile: null, // <-- FILE STORED HERE
  });

  const [responses, setResponses] = useState(
    () => job?.formFields?.map((f) => ({ ...f, value: "" })) || []
  );

  // ❌ Redirect admins OR missing job OR draft job
  if (user || !job || job.status !== "live") {
    return <Navigate to="/jobs" replace />;
  }

  const handleFieldChange = (index, value) => {
    setResponses((prev) => {
      const next = [...prev];
      next[index].value = value;
      return next;
    });
  };

  const validate = () => {
    if (!applicant.firstName.trim()) return "First name required";
    if (!applicant.lastName.trim()) return "Last name required";
    if (!applicant.email.trim()) return "Email required";
    if (!applicant.contact.trim()) return "Contact number required";
    if (!applicant.resumeFile) return "Resume required";

    for (const field of responses) {
      if (field.required && !field.value.trim()) {
        return `Field "${field.label}" is required`;
      }
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    try {
      // Upload resume
      const resumeURL = await uploadResume(
        applicant.resumeFile,
        job.id,
        applicant.email
      );

      // Prepare candidate data
      const candidateData = {
        jobId: job.id,
        jobTitle: job.title,
        name: `${applicant.firstName} ${applicant.lastName}`.trim(),
        email: applicant.email,
        contact: applicant.contact,
        resume: resumeURL,
        answers: responses.map(({ label, inputType, required, value }) => ({
          label,
          inputType,
          required,
          value,
        })),
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      const newCandidate = await createCandidate(candidateData);

      // -------------------------
      //  ADD TO REDUX STORE ❤️
      // -------------------------
      dispatch(
        addCandidate({
          id: newCandidate.id, // Firestore ID
          ...candidateData,
        })
      );

      // Add log entry
      dispatch(
        addLog({
          actor: {
            name: candidateData.name || "Applicant",
            email: candidateData.email,
          },
          entityId: newCandidate.id,
          entityName: candidateData.name,
          entityType: "candidate",
          actionLabel: "applied to job",
        })
      );

      navigate("/jobs");
    } catch (err) {
      console.error("Candidate Submit Failed:", err);
      alert(
        "There was an error submitting your application. Please try again."
      );
    }
  };

  return (
    <Box
      sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 4 }}
    >
      <Card sx={{ maxWidth: 720, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>
            Apply for {job.title}
          </Typography>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <Stack direction={{ sm: "row" }} spacing={2}>
              <TextField
                label="First name"
                required
                value={applicant.firstName}
                onChange={(e) =>
                  setApplicant((p) => ({ ...p, firstName: e.target.value }))
                }
              />
              <TextField
                label="Last name"
                required
                value={applicant.lastName}
                onChange={(e) =>
                  setApplicant((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </Stack>

            <TextField
              label="Email"
              required
              type="email"
              value={applicant.email}
              onChange={(e) =>
                setApplicant((p) => ({ ...p, email: e.target.value }))
              }
            />

            <TextField
              label="Contact number"
              required
              type="tel"
              value={applicant.contact}
              onChange={(e) =>
                setApplicant((p) => ({ ...p, contact: e.target.value }))
              }
            />

            <TextField
              label="Resume"
              required
              type="file"
              inputProps={{ accept: ".pdf,.doc,.docx" }}
              onChange={(e) =>
                setApplicant((prev) => ({
                  ...prev,
                  resumeFile: e.target.files?.[0] || null,
                }))
              }
              helperText={applicant.resumeFile?.name || "Upload resume"}
            />

            {responses.map((field, index) => (
              <FieldInput
                key={index}
                field={field}
                onChange={(value) => handleFieldChange(index, value)}
              />
            ))}

            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained">
                Submit application
              </Button>
              <Button
                variant="text"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
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
  const props = {
    fullWidth: true,
    required: field.required,
    label: field.label,
    value: field.value || "",
    onChange: (e) => onChange(e.target.value),
  };

  switch (field.inputType) {
    case "textarea":
      return <TextField {...props} multiline minRows={3} />;
    case "number":
      return <TextField {...props} type="number" />;
    case "url":
      return <TextField {...props} type="url" />;
    case "file":
      return (
        <TextField
          {...props}
          type="file"
          value={undefined}
          onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
        />
      );
    default:
      return <TextField {...props} />;
  }
}
