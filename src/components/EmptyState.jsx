import { Box, Typography } from "@mui/material";

export default function EmptyState() {
  return (
    <Box
      sx={{
        border: "1px dashed #cbd5e1",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        bgcolor: "#f8fafc",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        No roles match those filters
      </Typography>
      <Typography variant="body2" sx={{ color: "#475569" }}>
        Try clearing a filter or searching with a different keyword.
      </Typography>
    </Box>
  );
}
