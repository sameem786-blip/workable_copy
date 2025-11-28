import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { getEmployee } from "../services/employee.service";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const employees = useSelector((state) => state.employees.list);
  const user = useSelector((state) => state.auth.user);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Protect route – only super-admin can see
  if (!user || user.role !== "super-admin") {
    return <Navigate to="/jobs" replace />;
  }

  // 2️⃣ Load employee (check Redux first, then Firebase)
  useEffect(() => {
    const localEmployee = employees.find((item) => String(item.id) === String(id));

    if (localEmployee) {
      setEmployee(localEmployee);
      setLoading(false);
      return;
    }

    // Fetch from Firebase if not found in Redux
    const fetchData = async () => {
      const fbEmployee = await getEmployee(id);
      setEmployee(fbEmployee);
      setLoading(false);
    };

    fetchData();
  }, [id, employees]);

  // 3️⃣ Show loading state
  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Loading employee...</Typography>
      </Box>
    );
  }

  // 4️⃣ If still no employee → real 404
  if (!employee) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Employee not found
        </Typography>
        <Typography sx={{ color: "#475569" }}>
          This employee record may have been removed.
        </Typography>
      </Box>
    );
  }

  // 5️⃣ Display Employee
  const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        {fullName || "Employee"}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip label={employee.role} sx={{ textTransform: "capitalize" }} />
        {employee.department && <Chip label={employee.department} />}
      </Stack>

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.25}>
            <InfoRow label="Name" value={fullName} />
            <InfoRow label="Email" value={employee.email} />
            <InfoRow label="Role" value={employee.role} />
            <InfoRow label="Department" value={employee.department || "—"} />
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
