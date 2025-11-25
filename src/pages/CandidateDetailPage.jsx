import { Box, Card, CardContent, Stack, Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const candidates = useSelector((state) => state.candidates.list);

  if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
    return <Navigate to="/jobs" replace />;
  }

  const candidate = candidates.find((item) => String(item.id) === String(id));

  if (!candidate) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Candidate not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="text" onClick={() => navigate("/candidates")} sx={{ mb: 1 }}>
        Back to candidates
      </Button>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        {candidate.name || "Candidate"}
      </Typography>
      <Typography sx={{ color: "#475569", mb: 2 }}>{candidate.email}</Typography>
      <Typography sx={{ color: "#475569", mb: 2 }}>Contact: {candidate.contact || "—"}</Typography>
      <Typography sx={{ color: "#475569", mb: 2 }}>Resume: {candidate.resume || "—"}</Typography>
      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.5}>
            <InfoRow label="Job" value={candidate.jobTitle} />
            <InfoRow label="Applied at" value={new Date(candidate.createdAt).toLocaleString()} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Application responses
            </Typography>
            {candidate.answers?.map((answer, index) => (
              <Stack key={index} spacing={0.25}>
                <Typography sx={{ fontWeight: 700 }}>{answer.label}</Typography>
                <Typography sx={{ color: "#475569" }}>{answer.value || "—"}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={0.5} alignItems={{ sm: "center" }}>
      <Typography variant="body2" sx={{ color: "#475569", minWidth: 140 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}
