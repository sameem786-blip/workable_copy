import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Avatar,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Button,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadCandidates } from "../store/candidatesSlice";

export default function CandidatesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: candidates, loading } = useSelector((state) => state.candidates);

  // Filters state
  const [search, setSearch] = useState("");
  const [job, setJob] = useState("");
  const [stage, setStage] = useState("");

  useEffect(() => {
    dispatch(loadCandidates());
  }, [dispatch]);

  // ==========================
  // Generate dynamic filter options
  // ==========================
  const jobOptions = [...new Set(candidates.map((c) => c.jobTitle).filter(Boolean))];
  const stageOptions = [
    ...new Set(candidates.map((c) => c.stage || c.status).filter(Boolean)),
  ];

  // Filtered candidates
  const filteredCandidates = candidates.filter((c) => {
    return (
      (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
      (!job || c.jobTitle === job) &&
      (!stage || (c.stage || c.status) === stage)
    );
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Candidates ({filteredCandidates.length})
      </Typography>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search all candidates using keywords"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Job</InputLabel>
          <Select value={job} onChange={(e) => setJob(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {jobOptions.map((j) => (
              <MenuItem key={j} value={j}>
                {j}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Stage</InputLabel>
          <Select value={stage} onChange={(e) => setStage(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {stageOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={() => dispatch(loadCandidates())}>
          Search
        </Button>
      </Stack>

      {/* Candidates List */}
      <Stack spacing={2}>
        {loading && <Typography>Loading candidates...</Typography>}

        {!loading && filteredCandidates.length === 0 && (
          <Typography>No candidates found.</Typography>
        )}

        {!loading &&
          filteredCandidates.map((c) => {
            const exp = c.experience && c.experience.length > 0 ? c.experience[0] : null;

            return (
              <Card
                key={c.id}
                sx={{ p: 2, cursor: "pointer", borderRadius: 2 }}
                onClick={() => navigate(`/candidates/${c.id}`)}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={c.photoURL || ""} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>
                    <Typography sx={{ color: "#64748b" }}>
                      {exp ? `${exp.title} at ${exp.company}` : "—"}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: 12 }}>
                      {c.address || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{c.jobTitle}</Typography>
                    <Chip
                      label={c.stage || c.status || "Applied"}
                      color={c.status === "rejected" ? "error" : "primary"}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Stack>
              </Card>
            );
          })}
      </Stack>
    </Box>
  );
}
