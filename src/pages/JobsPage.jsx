import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import JobFilters from "../components/JobFilters";
import JobRow from "../components/JobRow";
import EmptyState from "../components/EmptyState";

function uniqueOptions(items, key) {
  return Array.from(new Set(items.map((item) => item[key]))).sort();
}

export default function JobsPage() {
  const jobs = useSelector((state) => state.jobs.list);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [location, setLocation] = useState("All locations");
  const [roleType, setRoleType] = useState("All types");

  const departmentOptions = useMemo(() => ["All departments", ...uniqueOptions(jobs, "department")], [jobs]);
  const locationOptions = useMemo(() => ["All locations", ...uniqueOptions(jobs, "location")], [jobs]);
  const typeOptions = useMemo(() => ["All types", ...uniqueOptions(jobs, "type")], [jobs]);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.summary.toLowerCase().includes(term) ||
        job.department.toLowerCase().includes(term);

      const matchesDepartment = department === departmentOptions[0] || job.department === department;
      const matchesLocation = location === locationOptions[0] || job.location === location;
      const matchesType = roleType === typeOptions[0] || job.type === roleType;
      const isLive = job.status === "live";

      const isVisible = user && (user.role === "admin" || user.role === "super-admin") ? true : isLive;

      return matchesSearch && matchesDepartment && matchesLocation && matchesType && isVisible;
    });
  }, [department, departmentOptions, jobs, location, locationOptions, roleType, searchTerm, typeOptions, user]);

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%)",
          color: "#f8fafc",
          p: { xs: 3, sm: 4, md: 5 },
          mb: 3,
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
        }}
      >
        <Typography sx={{ textTransform: "uppercase", letterSpacing: 2, color: "#a5b4fc", fontSize: 12, mb: 1 }}>
          Now hiring
        </Typography>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Find your next role at XYZ
        </Typography>
        <Typography sx={{ color: "#e2e8f0", maxWidth: 820, lineHeight: 1.7, mb: 3 }}>
          Explore open positions, discover the teams behind the work, and join us in building the future of hiring.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Chip label={`${jobs.length} open roles`} sx={{ color: "#0f172a", background: "#f8fafc", fontWeight: 600 }} />
          <Chip label={`${uniqueOptions(jobs, "department").length} teams hiring`} sx={{ color: "#f8fafc", border: "1px solid rgba(255,255,255,0.3)" }} />
          <Chip label="Global locations" sx={{ color: "#f8fafc", border: "1px solid rgba(255,255,255,0.3)" }} />
        </Stack>
      </Box>

      <JobFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        department={department}
        onDepartmentChange={setDepartment}
        location={location}
        onLocationChange={setLocation}
        roleType={roleType}
        onRoleTypeChange={setRoleType}
        departmentOptions={departmentOptions}
        locationOptions={locationOptions}
        typeOptions={typeOptions}
      />

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              All jobs
            </Typography>
            <Chip label={`${filteredJobs.length} roles`} color="primary" variant="outlined" />
            {user && (user.role === "admin" || user.role === "super-admin") && (
              <Button variant="contained" size="small" onClick={() => navigate("/jobs/new")}>
                Add job
              </Button>
            )}
          </Stack>
          <Stack spacing={1.25}>
            {filteredJobs.length === 0 ? <EmptyState /> : filteredJobs.map((job) => <JobRow key={job.id} job={job} />)}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
