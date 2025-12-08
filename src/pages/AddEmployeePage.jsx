import { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import {
  createUserByAdminHTTP,
  updateUserByAdminHTTP,
  getUserProfile,
} from "../services/user.service";
import { addUser, updateUser } from "../store/usersSlice";
import { addLog } from "../store/logsSlice";

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
  const { id } = useParams(); // Get user ID from URL
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    password: "12345678",
    role: "admin",
  });

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (uid) => {
    try {
      setLoading(true);
      const data = await getUserProfile(uid);
      if (data) {
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          department: data.department || "",
          password: "", // leave blank for edit
          role: data.role || "admin",
        });
      } else {
        setError("User not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.department) {
      setError("Please select a department.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEditMode) {
        // Update user via Admin Function
        await updateUserByAdminHTTP({
          uid: id,
          firstName: form.firstName,
          lastName: form.lastName,
          department: form.department,
          role: form.role,
          // email & password not editable here
        });

        dispatch(
          updateUser({
            id,
            firstName: form.firstName,
            lastName: form.lastName,
            department: form.department,
            role: form.role,
          })
        );

        dispatch(
          addLog({
            actor: { name: user?.name || "User", email: user?.email || "" },
            entityId: id,
            entityName: `${form.firstName} ${form.lastName}`,
            entityType: "user",
            actionLabel: "updated",
          })
        );
      } else {
        // Create new user via Admin Function
        const result = await createUserByAdminHTTP({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          department: form.department,
        });

        const newUserId = result.uid;
        dispatch(
          addUser({
            id: newUserId,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            role: form.role,
            department: form.department,
          })
        );

        dispatch(
          addLog({
            actor: { name: user?.name || "User", email: user?.email || "" },
            entityId: newUserId,
            entityName: `${form.firstName} ${form.lastName}`,
            entityType: "user",
            actionLabel: "created",
          })
        );
      }

      setSuccess(true);
      setTimeout(() => navigate("/employees"), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to save user.");
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
              {isEditMode ? "Edit Employee" : "Add New Employee"}
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
              disabled={isEditMode} // Can't change email on edit
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

            <TextField label="Role" value={"admin"} select disabled>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            {!isEditMode && (
              <TextField
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={handleChange("password")}
                helperText="Password must be 8 characters. Default is 12345678."
              />
            )}

            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Employee" : "Save Employee"}
              </Button>
              <Button variant="text" onClick={() => navigate("/employees")}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* SUCCESS */}
      <Snackbar
        open={success}
        autoHideDuration={2500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Employee {isEditMode ? "updated" : "created"} successfully!
        </Alert>
      </Snackbar>

      {/* ERROR */}
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
