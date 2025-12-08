import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

import { getUserProfile } from "../services/user.service"; 

export default function EmployeeProfilePage() {
  const { id } = useParams();

  const users = useSelector((state) => state.users.list); 
  const authUser = useSelector((state) => state.auth.user);

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!authUser || authUser.role !== "super-admin") {
    return <Navigate to="/jobs" replace />;
  }

  useEffect(() => {
    const localUser = users.find((item) => String(item.id) === String(id));

    if (localUser) {
      setUserProfile(localUser);
      setLoading(false);
      return;
    }

    // Fetch from Firestore
    const fetchData = async () => {
      const fbUser = await getUserProfile(id);
      setUserProfile(fbUser ? { id, ...fbUser } : null);
      setLoading(false);
    };

    fetchData();
  }, [id, users]);

  // 3️⃣ Loading
  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Loading user...</Typography>
      </Box>
    );
  }

  // 4️⃣ Not found
  if (!userProfile) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          User not found
        </Typography>
        <Typography sx={{ color: "#475569" }}>
          This user record may have been removed.
        </Typography>
      </Box>
    );
  }

  // 5️⃣ Display User
  const fullName = `${userProfile.firstName || ""} ${
    userProfile.lastName || ""
  }`.trim();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        {fullName || "User"}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        {userProfile.role && (
          <Chip label={userProfile.role} sx={{ textTransform: "capitalize" }} />
        )}
        {userProfile.department && <Chip label={userProfile.department} />}
      </Stack>

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.25}>
            <InfoRow label="Name" value={fullName} />
            <InfoRow label="Email" value={userProfile.email} />
            <InfoRow label="Role" value={userProfile.role} />
            <InfoRow
              label="Department"
              value={userProfile.department || "—"}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={0.5}
      alignItems={{ sm: "center" }}
    >
      <Typography variant="body2" sx={{ color: "#475569", minWidth: 120 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}
