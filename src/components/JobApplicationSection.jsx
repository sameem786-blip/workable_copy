// src/components/job/JobApplicationForm.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useDispatch } from "react-redux";
import { addCandidate } from "../../src/store/candidatesSlice";
import { addLog } from "../../src/store/logsSlice";
import {
  createCandidate,
  uploadProfilePhoto,
  uploadResume,
} from "../../src/services/candidate.service";

export default function JobApplicationForm({ job, isAdmin }) {
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);

  // Personal information + high-level details
  const [applicant, setApplicant] = useState({
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    contact: "",
    address: "",
    photoFile: null,
    resumeFile: null,
    profileSummary: "",
    coverLetter: "",
  });

  // Education / Experience arrays (repeatable)
  const [education, setEducation] = useState([
    { school: "", fieldOfStudy: "", degree: "", startDate: "", endDate: "" },
  ]);
  const [experience, setExperience] = useState([
    {
      title: "",
      company: "",
      industry: "",
      summary: "",
      startDate: "",
      endDate: "",
      current: false,
    },
  ]);

  // Existing dynamic fields coming from job.applicationFields
  const [responses, setResponses] = useState(
    () => job?.applicationFields?.map((f) => ({ ...f, value: "" })) || []
  );

  if (isAdmin) {
    return (
      <Typography sx={{ color: "#64748b" }}>
        Admins cannot apply to jobs.
      </Typography>
    );
  }

  /* -------------------- handlers -------------------- */

  const handleApplicantChange = (field) => (e) => {
    const value =
      field === "photoFile" || field === "resumeFile"
        ? e.target.files?.[0] || null
        : e.target.value;

    setApplicant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setEducation((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addEducationRow = () => {
    setEducation((prev) => [
      ...prev,
      { school: "", fieldOfStudy: "", degree: "", startDate: "", endDate: "" },
    ]);
  };

  const removeEducationRow = (index) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    setExperience((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addExperienceRow = () => {
    setExperience((prev) => [
      ...prev,
      {
        title: "",
        company: "",
        industry: "",
        summary: "",
        startDate: "",
        endDate: "",
        current: false,
      },
    ]);
  };

  const removeExperienceRow = (index) => {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, value) => {
    setResponses((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  };

  /* -------------------- validation -------------------- */

  const validate = () => {
    if (!applicant.firstName.trim()) return "First name required";
    if (!applicant.lastName.trim()) return "Last name required";
    if (!applicant.email.trim()) return "Email required";
    if (!applicant.contact.trim()) return "Contact required";
    if (!applicant.resumeFile) return "Resume required";

    // education: if row has any data, school is required
    for (const [i, edu] of education.entries()) {
      const hasAny =
        edu.school ||
        edu.fieldOfStudy ||
        edu.degree ||
        edu.startDate ||
        edu.endDate;
      if (hasAny && !edu.school.trim()) {
        return `Education #${i + 1}: School is required`;
      }
    }

    // experience: if row has any data, title is required
    for (const [i, exp] of experience.entries()) {
      const hasAny =
        exp.title ||
        exp.company ||
        exp.industry ||
        exp.summary ||
        exp.startDate ||
        exp.endDate;
      if (hasAny && !exp.title.trim()) {
        return `Experience #${i + 1}: Title is required`;
      }
    }

    for (const field of responses) {
      if (field.required && !String(field.value ?? "").trim()) {
        return `Field "${field.label}" is required`;
      }
    }

    return null;
  };

  /* -------------------- submit -------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Upload profile photo
      const photoURL = await uploadProfilePhoto(
        applicant.photoFile,
        job.id,
        applicant.email
      );

      const candidateData = {
        jobId: job.id,
        jobTitle: job.title,
        name: `${applicant.firstName} ${applicant.lastName}`.trim(),
        email: applicant.email,
        contact: applicant.contact,
        headline: applicant.headline,
        address: applicant.address,
        photoURL: photoURL || null, // store uploaded photo URL
        profileSummary: applicant.profileSummary,
        coverLetter: applicant.coverLetter,
        education,
        experience,
        resume: resumeURL,
        answers: responses.map(({ label, inputType, required, value }) => ({
          label,
          inputType,
          required,
          value,
        })),
        createdAt: new Date().toISOString(),
      };

      const newCandidate = await createCandidate(candidateData);

      dispatch(addCandidate({ id: newCandidate.id, ...candidateData }));

      dispatch(
        addLog({
          actor: { name: candidateData.name, email: candidateData.email },
          entityId: newCandidate.id,
          entityName: candidateData.name,
          entityType: "candidate",
          actionLabel: "applied to job",
        })
      );

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application.");
    }
  };

  /* -------------------- render -------------------- */

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ borderRadius: 3, width: "100%", maxWidth: 800 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
          >
            Apply for {job.title}
          </Typography>

          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            {/* PERSONAL INFORMATION */}
            <SectionHeader title="Personal information" />

            <Stack direction={{ sm: "row" }} spacing={2}>
              <TextField
                label="First name"
                required
                fullWidth
                value={applicant.firstName}
                onChange={handleApplicantChange("firstName")}
              />
              <TextField
                label="Last name"
                required
                fullWidth
                value={applicant.lastName}
                onChange={handleApplicantChange("lastName")}
              />
            </Stack>

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={applicant.email}
              onChange={handleApplicantChange("email")}
            />

            <TextField
              label="Headline (Optional)"
              fullWidth
              value={applicant.headline}
              onChange={handleApplicantChange("headline")}
            />

            <TextField
              label="Phone (Optional)"
              fullWidth
              type="tel"
              value={applicant.contact}
              onChange={handleApplicantChange("contact")}
              helperText="The hiring team may use this number to contact you about this job."
            />

            <TextField
              label="Address (Optional)"
              fullWidth
              value={applicant.address}
              onChange={handleApplicantChange("address")}
              helperText="Include your city, region, and country, so that employers can easily manage your application."
            />

            <FileBox
              label="Photo (Optional)"
              helper="Choose file or drag and drop here"
              onChange={handleApplicantChange("photoFile")}
              file={applicant.photoFile}
              accept="image/*"
            />

            {/* PROFILE */}
            <SectionHeader title="Profile" />

            {/* EDUCATION */}
            <SubSectionHeader
              title="Education (Optional)"
              onAdd={addEducationRow}
            />
            <Stack spacing={2}>
              {education.map((edu, index) => (
                <Box
                  key={index}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    p: 2,
                    position: "relative",
                  }}
                >
                  {education.length > 1 && (
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={() => removeEducationRow(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}

                  <Stack spacing={2}>
                    <TextField
                      label="School"
                      required
                      fullWidth
                      value={edu.school}
                      onChange={(e) =>
                        handleEducationChange(index, "school", e.target.value)
                      }
                    />
                    <TextField
                      label="Field of study (Optional)"
                      fullWidth
                      value={edu.fieldOfStudy}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "fieldOfStudy",
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      label="Degree (Optional)"
                      fullWidth
                      value={edu.degree}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                    />
                    <Stack direction={{ sm: "row" }} spacing={2}>
                      <TextField
                        label="Start date (Optional)"
                        placeholder="MM/YYYY"
                        fullWidth
                        value={edu.startDate}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="End date (Optional)"
                        placeholder="MM/YYYY"
                        fullWidth
                        value={edu.endDate}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* EXPERIENCE */}
            <SubSectionHeader
              title="Experience (Optional)"
              onAdd={addExperienceRow}
            />

            <Stack spacing={2}>
              {experience.map((exp, index) => (
                <Box
                  key={index}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    p: 2,
                    position: "relative",
                  }}
                >
                  {experience.length > 1 && (
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={() => removeExperienceRow(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}

                  <Stack spacing={2}>
                    <TextField
                      label="Title"
                      fullWidth
                      required
                      value={exp.title}
                      onChange={(e) =>
                        handleExperienceChange(index, "title", e.target.value)
                      }
                    />
                    <TextField
                      label="Company (Optional)"
                      fullWidth
                      value={exp.company}
                      onChange={(e) =>
                        handleExperienceChange(index, "company", e.target.value)
                      }
                    />
                    <TextField
                      label="Industry (Optional)"
                      fullWidth
                      value={exp.industry}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "industry",
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      label="Summary (Optional)"
                      fullWidth
                      multiline
                      minRows={3}
                      value={exp.summary}
                      onChange={(e) =>
                        handleExperienceChange(index, "summary", e.target.value)
                      }
                    />
                    <Stack direction={{ sm: "row" }} spacing={2}>
                      <TextField
                        label="Start date (Optional)"
                        placeholder="MM/YYYY"
                        fullWidth
                        value={exp.startDate}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="End date (Optional)"
                        placeholder="MM/YYYY"
                        fullWidth
                        value={exp.endDate}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* DETAILS */}
            <SectionHeader title="Details" />

            <TextField
              label="Summary"
              required={false}
              fullWidth
              multiline
              minRows={3}
              value={applicant.profileSummary}
              onChange={handleApplicantChange("profileSummary")}
            />

            <FileBox
              label="Resume"
              helper="Choose file or drag and drop here"
              required
              onChange={handleApplicantChange("resumeFile")}
              file={applicant.resumeFile}
              accept=".pdf,.doc,.docx"
            />

            <TextField
              label="Cover letter (Optional)"
              fullWidth
              multiline
              minRows={3}
              value={applicant.coverLetter}
              onChange={handleApplicantChange("coverLetter")}
            />

            {/* Extra job-specific fields (like drywall questions) */}
            {responses.map((field, index) => (
              <FieldInput
                key={index}
                field={field}
                onChange={(val) => handleFieldChange(index, val)}
              />
            ))}

            <Button type="submit" variant="contained" size="large">
              Submit application
            </Button>
          </Stack>
        </CardContent>

        <Snackbar
          open={success}
          autoHideDuration={2500}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
            onClose={() => setSuccess(false)}
          >
            Application submitted successfully!
          </Alert>
        </Snackbar>
      </Card>
    </Box>
  );
}

/* -------------------- helpers / small components -------------------- */

function SectionHeader({ title }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 2 }} />
    </Box>
  );
}

function SubSectionHeader({ title, onAdd }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
      <Button size="small" variant="outlined" onClick={onAdd}>
        + Add
      </Button>
    </Box>
  );
}

function FileBox({ label, helper, required, onChange, file, accept }) {
  return (
    <Box>
      <Typography sx={{ mb: 1 }}>
        {label}
        {required && (
          <Typography component="span" sx={{ color: "error.main", ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>
      <TextField
        type="file"
        fullWidth
        inputProps={{ accept }}
        onChange={onChange}
        value={undefined}
        helperText={file?.name || helper}
      />
    </Box>
  );
}

function FieldInput({ field, onChange }) {
  const props = {
    fullWidth: true,
    required: field.required,
    label: field.label,
    value: field.value,
    onChange: (e) => onChange(e.target.value),
  };

  switch (field.inputType) {
    case "textarea":
      return <TextField {...props} multiline minRows={3} />;
    case "number":
      return <TextField {...props} type="number" />;
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
