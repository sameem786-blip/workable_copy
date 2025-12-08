// pages/Employees.js
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUsers } from "../store/usersSlice";
import { fetchUsers, deleteUserByAdminHTTP } from "../services/user.service";
import { addLog } from "../store/logsSlice";

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.users.list);
  const currentUser = useSelector((state) => state.auth.user); // actor for logs

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        dispatch(setUsers(data));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    loadUsers();
  }, [dispatch]);

  // Delete user
  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmed) return;

    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    try {
      await deleteUserByAdminHTTP(userId);

      // Log the deletion
      dispatch(
        addLog({
          actor: {
            name: currentUser?.firstName + " " + currentUser?.lastName || "Unknown",
            email: currentUser?.email || "",
          },
          entityId: userId,
          entityName: `${userToDelete.firstName} ${userToDelete.lastName}`,
          entityType: "user",
          actionLabel: "deleted",
        })
      );

      // Refresh the users list
      const data = await fetchUsers();
      dispatch(setUsers(data));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete employee. Check console for details.");
    }
  };

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
          Add New
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
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || "—"}</TableCell>
                      <TableCell>{user.department || "—"}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          sx={{ mr: 1 }}
                          onClick={() => navigate(`/employees/edit/${user.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
