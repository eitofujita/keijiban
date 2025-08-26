import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  ListItemIcon,
  Avatar,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import ForumIcon from "@mui/icons-material/Forum";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function Sidebar({ isOpen, toggleMenu }: Props) {
  const { user } = useAuth();
  const { communities, loading } = useModeratedCommunities(user?.uid);
  const [openMyCommunities, setOpenMyCommunities] = useState(false);

  // 共通のテキストスタイル
  const textProps = {
    primaryTypographyProps: {
      sx: {
        fontSize: "0.85rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
  };

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
      {/* 閉じるボタン */}
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
            <ListItemText primary="ホーム" {...textProps} />
          </ListItemButton>
        </ListItem>

        {/* マイコミュニティー */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOpenMyCommunities(!openMyCommunities)}>
            <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
              <ForumIcon />
            </ListItemIcon>
            <ListItemText primary="Myコミュニティー" {...textProps} />
            {openMyCommunities ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        {/* 展開部分 */}
        <Collapse in={openMyCommunities} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Create Community */}
            <ListItem disablePadding sx={{ pl: 4 }}>
              <ListItemButton
                component={Link}
                to="/create-community"
                onClick={toggleMenu}
              >
                <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
                  <AddCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="コミュニティーを作成" {...textProps} />
              </ListItemButton>
            </ListItem>

            {/* Manage Communities */}
            <ListItem disablePadding sx={{ pl: 4 }}>
              <ListItemButton
                component={Link}
                to="/manage-communities"
                onClick={toggleMenu}
              >
                <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="設定" {...textProps} />
              </ListItemButton>
            </ListItem>

            {/* 自分のコミュニティー */}
            {!loading && communities.length > 0 && (
              <>
                <ListItem sx={{ pl: 4, pt: 2 }}>
                  <ListItemText 
                    primary="自分のコミュニティー" 
                    sx={{ color: "#999", fontSize: "0.875rem" }} 
                    {...textProps} 
                  />
                </ListItem>
                {communities.filter(c => c.hostId === user?.uid).map((c) => (
                  <ListItem disablePadding key={c.slug} sx={{ pl: 6 }}>
                    <ListItemButton
                      component={Link}
                      to={`/r/${c.slug}`}
                      onClick={toggleMenu}
                    >
                      <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
                        {c.iconUrl ? (
                          <Avatar src={c.iconUrl} sx={{ width: 24, height: 24 }} />
                        ) : (
                          <ForumIcon fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={`@${c.slug}`} {...textProps} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}

            {/* 参加中のコミュニティー */}
            {!loading && communities.length > 0 && (
              <>
                <ListItem sx={{ pl: 4, pt: 2 }}>
                  <ListItemText 
                    primary="参加中のコミュニティー" 
                    sx={{ color: "#999", fontSize: "0.875rem" }} 
                    {...textProps} 
                  />
                </ListItem>
                {communities.filter(c => c.hostId !== user?.uid).map((c) => (
                  <ListItem disablePadding key={c.slug} sx={{ pl: 6 }}>
                    <ListItemButton
                      component={Link}
                      to={`/r/${c.slug}`}
                      onClick={toggleMenu}
                    >
                      <ListItemIcon sx={{ color: "#bbb", minWidth: 40 }}>
                        {c.iconUrl ? (
                          <Avatar src={c.iconUrl} sx={{ width: 24, height: 24 }} />
                        ) : (
                          <ForumIcon fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={`@${c.slug}`} {...textProps} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}

            {/* コミュニティがない場合 */}
            {!loading && communities.length === 0 && (
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="なし" sx={{ color: "#777" }} {...textProps} />
              </ListItem>
            )}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
