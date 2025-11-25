import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addEmployee } from "../store/employeesSlice";
import { addLog } from "../store/logsSlice";

const roleOptions = ["admin"];
const departmentOptions = ["Operations", "Engineering", "Product", "People", "Marketing", "Customer Success"];

export default function AddEmployeePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "12345678",
    role: "admin",
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.department) return;
    const action = addEmployee(form);
    dispatch(action);
    const newEmployee = action.payload;
    dispatch(
      addLog({
        actor: { name: user?.name || "User", email: user?.email || "" },
        entityId: newEmployee.id,
        entityName: newEmployee.name || newEmployee.email,
        entityType: "employee",
        actionLabel: "created",
      })
    );
    navigate(`/employees/${newEmployee.id}`);
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", py: 4 }}>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          background: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Add new employee
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Only admin roles can be added. Password defaults to 12345678.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField label="Full name" required value={form.name} onChange={handleChange("name")} />
            <TextField label="Work email" type="email" required value={form.email} onChange={handleChange("email")} />
            <TextField
              label="Department"
              required
              select
              value={form.department}
              onChange={handleChange("department")}
            >
              {departmentOptions.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Role" value={form.role} select disabled>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              helperText="Password must be 8 characters. Default is 12345678."
            />
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained">
                Save employee
              </Button>
              <Button variant="text" onClick={() => navigate("/employees")}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
