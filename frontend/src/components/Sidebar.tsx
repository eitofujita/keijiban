import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  ListItemIcon,
  ListSubheader,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import ForumIcon from "@mui/icons-material/Forum";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";

interface Props {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function Sidebar({ isOpen, toggleMenu }: Props) {
 const { user } = useAuth();
const { communities, loading } = useModeratedCommunities(user?.uid);

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
        {/* Home */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/" onClick={toggleMenu}>
            <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        {/* Create Community */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/create-community"
            onClick={toggleMenu}
          >
            <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
              <AddCircleOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="コミュニティーを作成" />
          </ListItemButton>
        </ListItem>

        {/* Moderation Section */}
        {!loading && communities.length > 0 && (
          <>
            <ListSubheader sx={{ color: "#aaa" }}>マイコミュニティー</ListSubheader>
            {communities.map((c) => (
              <ListItem disablePadding key={c.slug}>
                <ListItemButton
                  component={Link}
                  to={`/r/${c.slug}/mod`}
                  onClick={toggleMenu}
                >
                  <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
                    {c.iconUrl ? (
                      <Avatar src={c.iconUrl} sx={{ width: 24, height: 24 }} />
                    ) : (
                      <ForumIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={`r/${c.slug}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Drawer>
  );
}
