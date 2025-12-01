import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
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
import HeaderActions from "./components/HeaderActions";
import NavLinks from "./components/NavLinks";
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
import {
  RequireGuest,
  RequireAdminOrSuper,
  RequireSuperAdmin,
} from "./components/RootGuards";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "./services/user.service";

import { loginSuccess, logout } from "./store/authSlice";

import "./App.css";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super-admin";

  // Prevent UI flashing before Firebase syncs
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ Restore user on refresh
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);

        dispatch(
          loginSuccess({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...profile,
          })
        );
      } else {
        dispatch(logout());
      }

      setAuthLoading(false);
    });

    return () => unsub();
  }, [dispatch]);

  // ⛔ Prevent rendering until Firebase restores user
  if (authLoading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

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
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography
                variant="h6"
                component={RouterLink}
                to="/jobs"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                XYZ Careers
              </Typography>
              <NavLinks
                isLoggedIn={Boolean(user)}
                isSuperAdmin={isSuperAdmin}
              />
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

export default App;
