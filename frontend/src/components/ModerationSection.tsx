// src/components/sidebar/ModerationSection.tsx
import { useState } from "react";
import {
  List, ListItemButton, ListItemIcon, ListItemText,
  ListSubheader, Collapse, Avatar, Skeleton
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ForumIcon from "@mui/icons-material/Forum";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";
import { useJoinedCommunities } from "../hooks/useJoinedCommunities"; // 追加

export default function ModerationSection() {
  const { user } = useAuth();
  const [open, setOpen] = useState(true);

  const { loading: loadingMod, communities: modCommunities } = useModeratedCommunities(user?.uid);
  const { loading: loadingJoined, communities: joinedCommunities } = useJoinedCommunities(user?.uid);

  if (!user) return null;
  if (!loadingMod && !loadingJoined && modCommunities.length === 0 && joinedCommunities.length === 0) return null;


  const nonModCommunities = joinedCommunities.filter(
    jc => !modCommunities.some(mc => mc.slug === jc.slug)
  );

  return (
    <List
      subheader={
        <ListSubheader component="div" sx={{ bgcolor: "transparent", color: "#bbb", fontWeight: 700 }}>
          Moderation
        </ListSubheader>
      }
      sx={{ py: 0 }}
    >
      
      <ListItemButton onClick={() => setOpen(v => !v)}>
        <ListItemText primary="Tools" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton component={Link} to="/mod/queue" sx={{ pl: 4 }}>
            <ListItemIcon><Inventory2Icon /></ListItemIcon>
            <ListItemText primary="Mod Queue" />
          </ListItemButton>
          <ListItemButton component={Link} to="/mod/mail" sx={{ pl: 4 }}>
            <ListItemIcon><MailOutlineIcon /></ListItemIcon>
            <ListItemText primary="Mod Mail" />
          </ListItemButton>
        </List>
      </Collapse>

      
      {modCommunities.length > 0 && (
        <>
          <ListSubheader component="div" sx={{ bgcolor: "transparent", color: "#bbb", mt: 1 }}>
            Your moderated communities
          </ListSubheader>

          {loadingMod ? (
            <>
              <Skeleton variant="rectangular" height={36} sx={{ mx: 2, mb: 1, bgcolor: "#2a2a2a" }} />
              <Skeleton variant="rectangular" height={36} sx={{ mx: 2, bgcolor: "#2a2a2a" }} />
            </>
          ) : (
            modCommunities.map(c => (
              <ListItemButton key={c.slug} component={Link} to={`/r/${c.slug}/mod`} sx={{ pl: 2 }}>
                <ListItemIcon>
                  {c.iconUrl ? <Avatar src={c.iconUrl} sx={{ width: 24, height: 24 }} /> : <ForumIcon />}
                </ListItemIcon>
                <ListItemText primary={`r/${c.slug}`} />
              </ListItemButton>
            ))
          )}
        </>
      )}

      {/* --- Joined communities（モデレーター以外） --- */}
      {nonModCommunities.length > 0 && (
        <>
          <ListSubheader component="div" sx={{ bgcolor: "transparent", color: "#bbb", mt: 1 }}>
            Your communities
          </ListSubheader>

          {loadingJoined ? (
            <>
              <Skeleton variant="rectangular" height={36} sx={{ mx: 2, mb: 1, bgcolor: "#2a2a2a" }} />
              <Skeleton variant="rectangular" height={36} sx={{ mx: 2, bgcolor: "#2a2a2a" }} />
            </>
          ) : (
            nonModCommunities.map(c => (
              <ListItemButton key={c.slug} component={Link} to={`/r/${c.slug}`} sx={{ pl: 2 }}>
                <ListItemIcon>
                  {c.iconUrl ? <Avatar src={c.iconUrl} sx={{ width: 24, height: 24 }} /> : <ForumIcon />}
                </ListItemIcon>
                <ListItemText primary={`r/${c.slug}`} />
              </ListItemButton>
            ))
          )}
        </>
      )}
    </List>
  );
}
