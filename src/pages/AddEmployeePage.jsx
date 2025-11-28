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
  Snackbar,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addEmployee } from "../store/employeesSlice";
import { addLog } from "../store/logsSlice";
import { createEmployee } from "../services/employee.service";

const roleOptions = ["admin"];
const departmentOptions = [
  "Operations",
  "Engineering",
  "Product",
  "People",
  "Marketing",
  "Customer Success",
];

export default function AddEmployeePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    password: "12345678",
    role: roleOptions[0],
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  // --------------------------------------------------------
  // ✅ Correct Firebase Submit Handler
  // --------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.department) {
      setError("Please select a department.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ Create employee in Firestore
      const created = await createEmployee(form); // <-- real API call!

      // 2️⃣ Update Redux store
      dispatch(addEmployee({ id: created.id, ...form }));

      // 3️⃣ Log the action
      dispatch(
        addLog({
          actor: { name: user?.name || "User", email: user?.email || "" },
          entityId: created.id,
          entityName: `${form.firstName} ${form.lastName}`.trim(),
          entityType: "employee",
          actionLabel: "created",
        })
      );

      // 4️⃣ Show success snackbar
      setSuccess(true);

      // 5️⃣ Redirect after brief delay
      setTimeout(() => navigate(`/employees/${created.id}`), 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 4 }}>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          background: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Add new employee
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Only admin roles can be added. Password defaults to 12345678.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="First name"
              required
              value={form.firstName}
              onChange={handleChange("firstName")}
            />
            <TextField
              label="Last name"
              required
              value={form.lastName}
              onChange={handleChange("lastName")}
            />

            <TextField
              label="Work email"
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
            />

            <TextField
              label="Department"
              required
              select
              value={form.department}
              onChange={handleChange("department")}
            >
              {departmentOptions.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Role" value={"admin"} select disabled >
               {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              helperText="Password must be 8 characters. Default is 12345678."
            />

            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Saving..." : "Save employee"}
              </Button>
              <Button variant="text" onClick={() => navigate("/employees")}>
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
          Employee created successfully!
        </Alert>
      </Snackbar>

      {/* ERROR SNACKBAR */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
