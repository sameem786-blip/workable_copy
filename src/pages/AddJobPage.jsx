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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addJob } from "../store/jobsSlice";
import { addLog } from "../store/logsSlice";
import { formFieldTypes } from "../constants/formFieldTypes";

const typeOptions = ["Full-time", "Part-time", "Contract"];
const departmentOptions = ["Engineering", "Product", "Customer Success", "People", "Marketing"];

export default function AddJobPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    summary: "",
    description: "",
    status: "draft",
  });
  const [formFields, setFormFields] = useState([{ label: "Resume", required: true, inputType: "file" }]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddField = () => {
    setFormFields((prev) => [...prev, { label: "", required: false, inputType: "text" }]);
  };

  const handleFieldChange = (index, key, value) => {
    setFormFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleSubmit = (event, statusOverride) => {
    event.preventDefault();
    const status = statusOverride || form.status || "draft";
    const job = {
      ...form,
      posted: "Just now",
      status,
      formFields: formFields.filter((field) => field.label.trim()),
    };
    const action = addJob(job);
    dispatch(action);
    const newJob = action.payload;
    dispatch(
      addLog({
        actor: { name: user?.name || "User", email: user?.email || "" },
        entityId: newJob.id,
        entityName: newJob.title,
        entityType: "job",
        actionLabel: status === "live" ? "published job" : "saved job as draft",
      })
    );
    navigate(`/jobs/${newJob.id}`);
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 4 }}>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 680,
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
              Fill out the details below. New jobs are logged and clickable from the activity log.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={(e) => handleSubmit(e, form.status)}>
            <TextField label="Title" required value={form.title} onChange={handleChange("title")} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Department"
                required
                select
                value={form.department}
                onChange={handleChange("department")}
                sx={{ flex: 1 }}
              >
                {departmentOptions.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Type"
                required
                select
                value={form.type}
                onChange={handleChange("type")}
                sx={{ width: { xs: "100%", sm: 200 } }}
              >
                {typeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField label="Location" required value={form.location} onChange={handleChange("location")} />
            <TextField
              label="Short summary"
              required
              multiline
              minRows={2}
              value={form.summary}
              onChange={handleChange("summary")}
            />
            <TextField
              label="Description"
              required
              multiline
              minRows={4}
              value={form.description}
              onChange={handleChange("description")}
            />
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Application form fields
              </Typography>
              {formFields.map((field, index) => (
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
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" onClick={(e) => handleSubmit(e, "live")}>
                Create job
              </Button>
              <Button variant="outlined" onClick={(e) => handleSubmit(e, "draft")}>
                Save as draft
              </Button>
              <Button variant="text" onClick={() => navigate("/jobs")}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
