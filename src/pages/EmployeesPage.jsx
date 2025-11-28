import { useEffect } from "react";
import {
  Box,
  Button,
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
import AddIcon from "@mui/icons-material/Add";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setEmployees } from "../store/employeesSlice";
import { fetchEmployees } from "../services/employee.service";

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const employees = useSelector((state) => state.employees.list);

  // Load employees from Firebase
  useEffect(() => {
    const loadEmployees = async () => {
      const data = await fetchEmployees();
      dispatch(setEmployees(data));
    };

    loadEmployees();
  }, [dispatch]);

  return (
    <Box sx={{ mt: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Employees
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/employees/new")}
        >
          Add new
        </Button>
      </Stack>

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>
                      {employee.firstName + " " + employee.lastName}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role || "—"}</TableCell>
                    <TableCell>{employee.department || "—"}</TableCell>
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
