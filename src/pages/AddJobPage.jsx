// src/pages/AddJobPage.jsx

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addJob } from "../store/jobsSlice";
import { addLog } from "../store/logsSlice";
import { createJob } from "../services/job.service";

// Select options
const jobLocationTypes = ["On-site", "Remote", "Hybrid"];
const employmentTypes = ["Full-time", "Part-time", "Contract"];
const experienceLevels = ["Entry", "Mid", "Senior", "Lead"];
const currencyOptions = ["USD", "EUR", "GBP", "AED"];
const companyIndustryOptions = ["Technology", "Healthcare", "Finance"];
const jobFunctionOptions = ["Engineering", "Sales", "Marketing"];
const jobEducationOptions = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];
const departmentOptions = [
  "Engineering",
  "Product",
  "Customer Success",
  "People",
  "Marketing",
];

/* ----------------------------------------------------------
   ARRAY INPUT COMPONENT (Chip + TextField)
----------------------------------------------------------- */

const ArrayInput = ({ label, values, onAdd, onDelete }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <Box>
      <Typography sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography>

      {/* Chips */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
        {values.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => onDelete(index)}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>

      {/* Input */}
      <TextField
        placeholder={`Add ${label} (press Enter)`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
      />
    </Box>
  );
};

/* ----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */

export default function AddJobPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Form State
  const [form, setForm] = useState({
    title: "",
    department: "",
    type: "Full-time",
    location: "",
    summary: "",
    description: "",
    status: "draft",

    jobInfo: {
      locationType: "",
      requirements: [],
      benefits: [],
      jobFunction: "",
      experience: "",
      employmentType: "",
      education: "",
    },

    companyInfo: {
      industry: "",
    },

    salary: {
      from: "",
      to: "",
      currency: "USD",
    },
  });

  // Update simple fields
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Update nested form fields
  const updateNested = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  // Snackbar State
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Submit Handler
  const handleSubmit = async (event, statusOverride) => {
    event.preventDefault();

    if (!form.title || !form.location || !form.description) {
      setErrorMessage("Please fill out all required fields.");
      setError(true);
      return;
    }

    const status = statusOverride || form.status || "draft";

    const job = {
      ...form,
      status,
      posted: new Date().toISOString(),

      applicationFields: [
        {
          label: "Resume",
          required: true,
          inputType: "file",
        },
      ],

      createdBy: {
        name: user?.name || "Unknown",
        email: user?.email || "",
        uid: user?.uid || "",
      },
    };

    try {
      const newJob = await createJob(job);
      dispatch(addJob(newJob));

      dispatch(
        addLog({
          actor: { name: user?.name, email: user?.email },
          entityId: newJob.id,
          entityName: newJob.title,
          entityType: "job",
          actionLabel:
            status === "live" ? "published job" : "saved job as draft",
        })
      );

      setSuccessMessage("Job created successfully!");
      setSuccess(true);

      setTimeout(() => {
        navigate(`/jobs/${newJob.id}`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to create job.");
      setError(true);
    }
  };

  return (
    <Box
      sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 4 }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          background: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Create a new job
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Fill out the job details below.
            </Typography>
          </Stack>

          {/* FORM START */}
          <Stack
            component="form"
            spacing={3}
            onSubmit={(e) => handleSubmit(e, form.status)}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Job Details
            </Typography>

            <TextField
              label="Job Title"
              required
              value={form.title}
              onChange={handleChange("title")}
            />

            <TextField
              label="Location"
              required
              value={form.location}
              onChange={handleChange("location")}
            />

            <TextField
              label="Description"
              required
              multiline
              minRows={4}
              value={form.description}
              onChange={handleChange("description")}
            />

            {/* JOB INFO */}

            <TextField
              label="Job Location Type"
              select
              value={form.jobInfo.locationType}
              onChange={(e) =>
                updateNested("jobInfo", "locationType", e.target.value)
              }
            >
              {jobLocationTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>

            {/* Requirements Array */}
            <ArrayInput
              label="Requirements"
              values={form.jobInfo.requirements}
              onAdd={(val) =>
                updateNested("jobInfo", "requirements", [
                  ...form.jobInfo.requirements,
                  val,
                ])
              }
              onDelete={(index) => {
                const updated = [...form.jobInfo.requirements];
                updated.splice(index, 1);
                updateNested("jobInfo", "requirements", updated);
              }}
            />

            {/* Benefits Array */}
            <ArrayInput
              label="Benefits"
              values={form.jobInfo.benefits}
              onAdd={(val) =>
                updateNested("jobInfo", "benefits", [
                  ...form.jobInfo.benefits,
                  val,
                ])
              }
              onDelete={(index) => {
                const updated = [...form.jobInfo.benefits];
                updated.splice(index, 1);
                updateNested("jobInfo", "benefits", updated);
              }}
            />

            {/* EMPLOYEE REQUIREMENTS */}

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Employee Requirements
            </Typography>

            <TextField
              label="Employment Type"
              select
              value={form.jobInfo.employmentType}
              onChange={(e) =>
                updateNested("jobInfo", "employmentType", e.target.value)
              }
            >
              {employmentTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Experience Level"
              select
              value={form.jobInfo.experience}
              onChange={(e) =>
                updateNested("jobInfo", "experience", e.target.value)
              }
            >
              {experienceLevels.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  {lvl}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Education Requirement"
              select
              value={form.jobInfo.education}
              onChange={(e) =>
                updateNested("jobInfo", "education", e.target.value)
              }
            >
              {jobEducationOptions.map((edu) => (
                <MenuItem key={edu} value={edu}>
                  {edu}
                </MenuItem>
              ))}
            </TextField>

            {/* COMPANY INFO */}

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Company industry and Job function
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Company industry"
                select
                value={form.companyInfo.industry}
                onChange={(e) =>
                  updateNested("companyInfo", "industry", e.target.value)
                }
                sx={{ flex: 1 }}
              >
                <MenuItem value="">
                  <em>Select...</em>
                </MenuItem>
                {companyIndustryOptions.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Job function"
                select
                value={form.jobInfo.jobFunction}
                onChange={(e) =>
                  updateNested("jobInfo", "jobFunction", e.target.value)
                }
                sx={{ flex: 1 }}
              >
                <MenuItem value="">
                  <em>Select...</em>
                </MenuItem>
                {jobFunctionOptions.map((fn) => (
                  <MenuItem key={fn} value={fn}>
                    {fn}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* SALARY */}

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Annual Salary
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="From"
                type="number"
                value={form.salary.from}
                onChange={(e) =>
                  updateNested("salary", "from", e.target.value)
                }
                sx={{ flex: 1 }}
              />

              <TextField
                label="To"
                type="number"
                value={form.salary.to}
                onChange={(e) =>
                  updateNested("salary", "to", e.target.value)
                }
                sx={{ flex: 1 }}
              />

              <TextField
                label="Currency"
                select
                value={form.salary.currency}
                onChange={(e) =>
                  updateNested("salary", "currency", e.target.value)
                }
                sx={{ width: 150 }}
              >
                {currencyOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* BUTTONS */}

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                onClick={(e) => handleSubmit(e, "live")}
              >
                Create job
              </Button>

              <Button
                variant="outlined"
                onClick={(e) => handleSubmit(e, "draft")}
              >
                Save as draft
              </Button>

              <Button variant="text" onClick={() => navigate("/jobs")}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={success}
        autoHideDuration={2500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* ERROR SNACKBAR */}
      <Snackbar
        open={error}
        autoHideDuration={2500}
        onClose={() => setError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
