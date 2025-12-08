import { useEffect, useMemo } from "react";
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
import { useSelector, useDispatch } from "react-redux";

import { fetchLogsFromFirestore } from "../services/log.service";
import { setLogs } from "../store/logsSlice";

export default function LogsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logs = useSelector((state) => state.logs.entries);
  const jobs = useSelector((state) => state.jobs.list);
  const users = useSelector((state) => state.users.list);

  // 🔥 Fetch logs on mount
  useEffect(() => {
    const loadLogs = async () => {
      const firebaseLogs = await fetchLogsFromFirestore();
      dispatch(setLogs(firebaseLogs));
    };

    loadLogs();
  }, [dispatch]);

  // Lookup maps to resolve job/user names
  const jobLookup = useMemo(() => {
    const map = new Map();
    jobs?.forEach((job) => map.set(String(job.id), job));
    return map;
  }, [jobs]);

  const userLookup = useMemo(() => {
    const map = new Map();
    users?.forEach((u) => map.set(String(u.id), u));
    return map;
  }, [users]);

  // 🔗 Render the correct link for each log entry
  const renderLink = (log) => {
    // Job item
    if (log.entityType === "job") {
      const job = jobLookup.get(String(log.entityId));
      if (!job)
        return <Typography sx={{ color: "#94a3b8" }}>Job unavailable</Typography>;

      return (
        <Link
          component="button"
          underline="hover"
          onClick={() => navigate(`/jobs/${job.id}`)}
          sx={{ fontWeight: 700 }}
        >
          {job.title}
        </Link>
      );
    }

    // User (used to be employee)
    if (log.entityType === "user") {
      const user = userLookup.get(String(log.entityId));
      if (!user)
        return (
          <Typography sx={{ color: "#94a3b8" }}>User unavailable</Typography>
        );

      const fullName = user.firstName
        ? `${user.firstName} ${user.lastName}`
        : user.email;

      return (
        <Link
          component="button"
          underline="hover"
          onClick={() => navigate(`/employees/${user.id}`)}
          sx={{ fontWeight: 700 }}
        >
          {fullName}
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
                      <Typography sx={{ color: "#475569" }}>
                        No activity yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {log.actor?.name || "Unknown user"}{" "}
                            {log.actionLabel || "performed"} {log.entityType} action
                          </Typography>

                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                            {log.actor?.email}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>{renderLink(log)}</TableCell>

                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
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
