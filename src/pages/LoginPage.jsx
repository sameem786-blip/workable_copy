import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import MailIcon from "@mui/icons-material/Mail";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginSuccess } from "../store/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employees.list);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/jobs";

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState("");
  const timeoutRef = useRef(null);

  const handleChange = (field) => (event) => {
    const value =
      field === "remember" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const match = employees.find(
      (user) =>
        user.email.toLowerCase() === form.email.trim().toLowerCase() &&
        user.password === form.password
    );

    if (!match) {
      setError(
        "Invalid credentials. Try super-admin@gmail.com or admin@gmail.com with password 12345678."
      );
      setSuccess(false);
      return;
    }

    const displayName = deriveName(match.email);
    setLoggedInRole(match.role);
    setSuccess(true);
    setError("");
    dispatch(
      loginSuccess({
        email: match.email,
        role: match.role,
        name: displayName,
      })
    );
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      navigate(redirectTo);
    }, 800);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <Box
      sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 6 }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          background: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={0.75} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Sign in to manage your applications and view saved roles.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="Work email"
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              InputProps={{
                startAdornment: (
                  <MailIcon fontSize="small" sx={{ mr: 1, color: "#94a3b8" }} />
                ),
              }}
              error={Boolean(error)}
            />
            <TextField
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              InputProps={{
                startAdornment: (
                  <LockIcon fontSize="small" sx={{ mr: 1, color: "#94a3b8" }} />
                ),
              }}
              error={Boolean(error)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.remember}
                  onChange={handleChange("remember")}
                />
              }
              label="Keep me signed in"
            />
            <Button type="submit" variant="contained" size="large">
              Login
            </Button>
          </Stack>
        </CardContent>
      </Card>

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
          Successfully logged in as {loggedInRole}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function deriveName(email) {
  if (!email) return "User";
  const base = email.split("@")[0] || "User";
  return base
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
