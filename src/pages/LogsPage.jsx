import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link,
} from "@mui/material";
import { useSelector } from "react-redux";

export default function LogsPage() {
  const logs = useSelector((state) => state.logs.entries);
  const navigate = useNavigate();
  const jobs = useSelector((state) => state.jobs.list);
  const employees = useSelector((state) => state.employees.list);

  const jobLookup = useMemo(() => {
    const map = new Map();
    jobs.forEach((job) => map.set(String(job.id), job));
    return map;
  }, [jobs]);

  const employeeLookup = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => map.set(String(emp.id), emp));
    return map;
  }, [employees]);

  const renderLink = (log) => {
    if (log.entityType === "job") {
      const job = jobLookup.get(String(log.entityId));
      if (!job) return <Typography sx={{ color: "#94a3b8" }}>Job unavailable</Typography>;
      return (
        <Link component="button" underline="hover" onClick={() => navigate(`/jobs/${job.id}`)} sx={{ fontWeight: 700 }}>
          {job.title}
        </Link>
      );
    }
    if (log.entityType === "employee") {
      const emp = employeeLookup.get(String(log.entityId));
      if (!emp) return <Typography sx={{ color: "#94a3b8" }}>Employee unavailable</Typography>;
      return (
        <Link
          component="button"
          underline="hover"
          onClick={() => navigate(`/employees/${emp.id}`)}
          sx={{ fontWeight: 700 }}
        >
          {emp.name || emp.email}
        </Link>
      );
    }
    return <Typography sx={{ color: "#94a3b8" }}>Unavailable</Typography>;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Activity logs
      </Typography>

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activity</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography sx={{ color: "#475569" }}>No activity yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                            {log.actor?.name || "Unknown user"} {log.actionLabel || "created"} a new {log.entityType}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                            {log.actor?.email}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{renderLink(log)}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
