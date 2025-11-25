import { useState } from "react";
import { BrowserRouter, Link as RouterLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import LoginPage from "./pages/LoginPage";
import EmployeesPage from "./pages/EmployeesPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import AddJobPage from "./pages/AddJobPage";
import LogsPage from "./pages/LogsPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import ApplyJobPage from "./pages/ApplyJobPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import { logout } from "./store/authSlice";
import "./App.css";

function App() {
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super-admin";

  return (
    <BrowserRouter>
      <CssBaseline />
      <Box className="app-shell">
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography
                variant="h6"
                component={RouterLink}
                to="/jobs"
                sx={{ fontWeight: 800, letterSpacing: 0.5, textDecoration: "none", color: "inherit" }}
              >
                XYZ Careers
              </Typography>
              <NavLinks isLoggedIn={Boolean(user)} isSuperAdmin={isSuperAdmin} />
            </Box>
            <HeaderActions />
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ pt: { xs: 10, md: 11 }, pb: 7 }}>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route
                path="/jobs/:id/apply"
                element={
                  <RequireGuest>
                    <ApplyJobPage />
                  </RequireGuest>
                }
              />
              <Route
                path="/jobs/new"
                element={
                  <RequireAdminOrSuper>
                    <AddJobPage />
                  </RequireAdminOrSuper>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/employees"
                element={
                  <RequireSuperAdmin>
                    <EmployeesPage />
                  </RequireSuperAdmin>
                }
              />
              <Route
                path="/employees/new"
                element={
                  <RequireSuperAdmin>
                    <AddEmployeePage />
                  </RequireSuperAdmin>
                }
              />
              <Route
                path="/employees/:id"
                element={
                  <RequireSuperAdmin>
                    <EmployeeProfilePage />
                  </RequireSuperAdmin>
                }
              />
              <Route
                path="/logs"
                element={
                  <RequireAdminOrSuper>
                    <LogsPage />
                  </RequireAdminOrSuper>
                }
              />
              <Route
                path="/candidates"
                element={
                  <RequireAdminOrSuper>
                    <CandidatesPage />
                  </RequireAdminOrSuper>
                }
              />
              <Route
                path="/candidates/:id"
                element={
                  <RequireAdminOrSuper>
                    <CandidateDetailPage />
                  </RequireAdminOrSuper>
                }
              />
              <Route path="*" element={<Navigate to="/jobs" replace />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

function HeaderActions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {user ? (
        <>
          <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
            <Avatar sx={{ width: 36, height: 36, background: "#111827" }}>
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <MenuItem disabled>
              <Typography sx={{ fontWeight: 700 }}>{user.name || "User"}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {user.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Sign out</MenuItem>
          </Menu>
        </>
      ) : (
        <Button variant="contained" color="primary" sx={{ borderRadius: 999, px: 2.5 }} onClick={() => navigate("/login")}>
          Login
        </Button>
      )}
    </Box>
  );
}

function NavLinks({ isLoggedIn, isSuperAdmin }) {
  const user = useSelector((state) => state.auth.user);
  if (!isLoggedIn) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, color: "#0f172a", fontWeight: 600 }}>
      <Typography component={RouterLink} to="/jobs" sx={{ textDecoration: "none", color: "inherit" }}>
        Jobs
      </Typography>
      <Typography component={RouterLink} to="/candidates" sx={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}>
        Candidates
      </Typography>
      {(user?.role === "admin" || isSuperAdmin) && (
        <Typography component={RouterLink} to="/logs" sx={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}>
          Logs
        </Typography>
      )}
      {isSuperAdmin && (
        <>
          <Divider orientation="vertical" flexItem />
          <Typography component={RouterLink} to="/employees" sx={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}>
            Employees
          </Typography>
        </>
      )}
    </Box>
  );
}

function RequireSuperAdmin({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user || user.role !== "super-admin") {
    return <Navigate to="/jobs" replace />;
  }
  return children;
}

function RequireAdminOrSuper({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
    return <Navigate to="/jobs" replace />;
  }
  return children;
}

function RequireGuest({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (user) {
    return <Navigate to="/jobs" replace />;
  }
  return children;
}

export default App;
