import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { auth } from "../firebase";

function HeaderActions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    auth.signOut();
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

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem disabled>
              <Typography sx={{ fontWeight: 700 }}>
                {user.name || "User"}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2">{user.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Sign out</MenuItem>
          </Menu>
        </>
      ) : (
        <Button variant="contained" onClick={() => navigate("/login")}>
          Login
        </Button>
      )}
    </Box>
  );
}

export default HeaderActions;
