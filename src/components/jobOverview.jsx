// src/components/job/JobOverview.jsx
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Button,
} from "@mui/material";

export default function JobOverview({ job, isAdmin }) {
  return (
    <Box>
      {/* Description */}
      <Section title="Description">
        <Typography sx={{ lineHeight: 1.7 }}>{job.description}</Typography>
      </Section>

      {/* Requirements */}
      <Section title="Requirements">
        <List dense>
          {job.jobInfo?.requirements?.map((req, i) => (
            <ListItem key={i}>
              <ListItemText primary={req} />
            </ListItem>
          ))}
        </List>
      </Section>

      {/* Benefits */}
      <Section title="Benefits">
        <List dense>
          {job.jobInfo?.benefits?.map((b, i) => (
            <ListItem key={i}>
              <ListItemText primary={b} />
            </ListItem>
          ))}
        </List>
      </Section>

      {/* Job Details */}
      <Section title="Job Details">
        <Info label="Job Function" value={job.jobInfo?.jobFunction} />
        <Info label="Experience Level" value={job.jobInfo?.experience} />
        <Info label="Employment Type" value={job.jobInfo?.employmentType} />
        <Info label="Education Required" value={job.jobInfo?.education} />
      </Section>

      {/* Company Info */}
      <Section title="Company">
        <Info label="Industry" value={job.companyInfo?.industry} />
      </Section>

      {/* Salary */}
      <Section title="Salary">
        <Typography sx={{ fontWeight: 600 }}>
          {job.salary.from} – {job.salary.to} {job.salary.currency}
        </Typography>
      </Section>
      
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {children}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}

function Info({ label, value }) {
  return (
    <Typography sx={{ my: 0.6 }}>
      <strong>{label}: </strong>
      {value}
    </Typography>
  );
}
