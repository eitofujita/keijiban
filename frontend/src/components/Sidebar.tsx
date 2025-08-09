import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";

interface Props {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function Sidebar({ isOpen, toggleMenu }: Props) {
  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={toggleMenu}
      PaperProps={{
        sx: {
          width: 240,
          backgroundColor: "#1e1e1e",
          color: "#fff",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 2,
          py: 1,
          borderBottom: "1px solid #444",
        }}
      >
        <IconButton onClick={toggleMenu} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/" onClick={toggleMenu}>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
        </ListItem>
      </List>
    </Drawer>
  );
}

