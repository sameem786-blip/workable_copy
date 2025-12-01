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
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { loadCandidates } from "../store/candidatesSlice";

export default function CandidatesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: candidates, loading } = useSelector((state) => state.candidates);

  // 🔥 Load candidates from Firestore on page load
  useEffect(() => {
    dispatch(loadCandidates());
  }, [dispatch]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Candidates
      </Typography>

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {/* 🔥 Loading indicator */}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography sx={{ color: "#475569" }}>
                        Loading candidates...
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* No candidates */}
                {!loading && candidates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography sx={{ color: "#475569" }}>
                        No candidates yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Candidates list */}
                {!loading &&
                  candidates.map((candidate) => (
                    <TableRow
                      key={candidate.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>
                        {candidate.name || "—"}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.jobTitle}</TableCell>
                      <TableCell>
                        {candidate.createdAt
                          ? new Date(candidate.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
