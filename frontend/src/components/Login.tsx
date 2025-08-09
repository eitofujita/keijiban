import { Box, Typography, Container, Paper } from "@mui/material";
import LoginButton from "../components/LoginButton";

export default function Login() {
  return (
    <Container maxWidth="sm">
      <Paper
        elevation={4}
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ログインしてください
        </Typography>

        {/* ボタン中央寄せ */}
        <Box mt={3} display="flex" justifyContent="center">
          <LoginButton />
        </Box>
      </Paper>
    </Container>
  );
}
