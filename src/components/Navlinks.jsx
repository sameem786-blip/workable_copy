import { Box, Typography, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";

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
          <Typography
            component={RouterLink}
            to="/employees"
            sx={{ textDecoration: "none", color: "inherit", opacity: 0.7 }}
          >
            Employees
          </Typography>
        </>
      )}
    </Box>
  );
}

export default NavLinks;
