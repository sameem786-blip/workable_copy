import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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
import { fetchUsers } from "../services/user.service";

export default function LoginPage() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setError("User profile not found in Firestore.");
        return;
      }
      const profile = userSnap.data();
      const role = Array.isArray(profile.role) ? profile.role[0] : profile.role;
      const fullName =
        `${profile.firstName} ${profile.lastName}`.trim() ||
        deriveName(user.email);
      dispatch(
        loginSuccess({
          uid: user.uid,
          email: user.email,
          role,
          name: fullName,
          department: profile.department,
        })
      );

      setLoggedInRole(role);
      setSuccess(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => navigate(redirectTo), 800);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
      setSuccess(false);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      setUsers(da5ta);
    };
    loadUsers();
  }, []);

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
