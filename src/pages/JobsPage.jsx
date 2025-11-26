import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import JobFilters from "../components/JobFilters";
import JobRow from "../components/JobRow";
import EmptyState from "../components/EmptyState";

import { fetchJobs } from "../services/jobService";

function uniqueOptions(items, key) {
  return Array.from(new Set(items.map((item) => item[key]))).sort();
}

export default function JobsPage() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [location, setLocation] = useState("All locations");
  const [roleType, setRoleType] = useState("All types");

  // LOAD JOBS FROM FIRESTORE
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchJobs();
      setJobs(list);
      setLoading(false);
    };
    load();
  }, []);

  // MUST stay before return — ALWAYS RUNS, regardless of loading
  const { filteredJobs, departmentOptions, locationOptions, typeOptions } =
    useMemo(() => {
      const departmentOptions = [
        "All departments",
        ...uniqueOptions(jobs, "department"),
      ];

      const locationOptions = [
        "All locations",
        ...uniqueOptions(jobs, "location"),
      ];

      const typeOptions = ["All types", ...uniqueOptions(jobs, "type")];

      const term = searchTerm.trim().toLowerCase();

      const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
          !term ||
          job.title.toLowerCase().includes(term) ||
          job.summary?.toLowerCase().includes(term) ||
          job.department.toLowerCase().includes(term);

        const matchesDepartment =
          department === departmentOptions[0] || job.department === department;

        const matchesLocation =
          location === locationOptions[0] || job.location === location;

        const matchesType =
          roleType === typeOptions[0] || job.type === roleType;

        const isLive = job.status === "live";
        const isVisible =
          user && (user.role === "admin" || user.role === "super-admin")
            ? true
            : isLive;

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesLocation &&
          matchesType &&
          isVisible
        );
      });

      return {
        filteredJobs,
        departmentOptions,
        locationOptions,
        typeOptions,
      };
    }, [jobs, searchTerm, department, location, roleType, user]);

  // 🔥 FIXED — return AFTER all hooks run
  return (
    <Box>
      {loading ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6">Loading jobs...</Typography>
        </Box>
      ) : (
        <>
          {/* Banner */}
          <Box
            sx={{
              borderRadius: 3,
              background:
                "linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%)",
              color: "#f8fafc",
              p: { xs: 3, sm: 4, md: 5 },
              mb: 3,
            }}
          >
            <Typography sx={{ color: "#a5b4fc", fontSize: 12 }}>
              Now hiring
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Find your next role at XYZ
            </Typography>
          </Box>

          {/* Filters */}
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

          {/* Job List */}
          <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">All jobs</Typography>
                <Chip
                  label={`${filteredJobs.length} roles`}
                  color="primary"
                  variant="outlined"
                />
                {(user?.role === "admin" || user?.role === "super-admin") && (
                  <Button onClick={() => navigate("/jobs/new")}>Add job</Button>
                )}
              </Stack>

              <Stack spacing={1}>
                {filteredJobs.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredJobs.map((job) => <JobRow key={job.id} job={job} />)
                )}
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
