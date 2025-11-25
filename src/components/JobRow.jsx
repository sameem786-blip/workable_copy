import { Paper, Stack, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PlaceIcon from "@mui/icons-material/Place";
import CategoryIcon from "@mui/icons-material/Category";
import { useNavigate } from "react-router-dom";

export default function JobRow({ job }) {
  const navigate = useNavigate();

  return (
    <Paper
      variant="outlined"
      onClick={() => navigate(`/jobs/${job.id}`)}
      sx={{
        p: { xs: 1.25, sm: 1.75 },
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderColor: "#e5e7eb",
        cursor: "pointer",
        transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
          borderColor: "#d9ddff",
        },
      }}
    >
      <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.75}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
          {job.title}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 2 }} flexWrap="wrap">
          <InfoPill icon={<CategoryIcon fontSize="small" />} label={job.department} />
          <InfoPill icon={<WorkOutlineIcon fontSize="small" />} label={job.type} />
          <InfoPill icon={<PlaceIcon fontSize="small" />} label={job.location} />
        </Stack>
      </Stack>
      <ArrowForwardIosIcon sx={{ color: "#94a3b8", fontSize: 16 }} />
    </Paper>
  );
}

function InfoPill({ icon, label }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "#334155", fontWeight: 600, fontSize: 14 }}>
      {icon}
      <span>{label}</span>
    </Stack>
  );
}
