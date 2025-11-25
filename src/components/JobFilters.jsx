import { Grid, InputAdornment, MenuItem, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function JobFilters({
  searchTerm,
  onSearchChange,
  department,
  onDepartmentChange,
  location,
  onLocationChange,
  roleType,
  onRoleTypeChange,
  departmentOptions,
  locationOptions,
  typeOptions,
}) {
  return (
    <Stack
      spacing={2}
      sx={{
        background: "#ffffff",
        borderRadius: 3,
        p: { xs: 2.25, sm: 2.75 },
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e5e7eb",
        mb: 3,
      }}
    >
      <TextField
        fullWidth
        placeholder="Search roles, keywords, or teams"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Department"
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value)}
          >
            {departmentOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth select label="Location" value={location} onChange={(event) => onLocationChange(event.target.value)}>
            {locationOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth select label="Type" value={roleType} onChange={(event) => onRoleTypeChange(event.target.value)}>
            {typeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Stack>
  );
}
