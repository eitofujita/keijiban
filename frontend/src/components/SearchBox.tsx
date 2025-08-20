import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  ClickAwayListener,
  Paper,
  Popper,
  Grow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import { searchAll, type PostHit, type CommunityHit } from "../services/search";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostHit[]>([]);
  const [communities, setCommunities] = useState<CommunityHit[]>([]);

  // 入力欄のDOMをアンカーにしてポッパーを出す
  const anchorRef = useRef<HTMLDivElement>(null);
  const [anchorWidth, setAnchorWidth] = useState<number | undefined>();

  // 入力のデバウンス
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) {
        setOpen(false);
        setPosts([]);
        setCommunities([]);
        return;
      }
      try {
        setLoading(true);
        const res = await searchAll(q, 10);
        setPosts(res.posts ?? []);
        setCommunities(res.communities ?? []);
        setOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // アンカー幅を追従（窓リサイズでも更新）
  useEffect(() => {
    const sync = () => setAnchorWidth(anchorRef.current?.offsetWidth);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const showEmpty = useMemo(
    () => !loading && posts.length === 0 && communities.length === 0 && q.trim().length > 0,
    [loading, posts.length, communities.length, q]
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={anchorRef} sx={{ position: "relative", width: 420, maxWidth: "50vw" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="検索（例: vrchat）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => (posts.length + communities.length > 0) && setOpen(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "#2c2c2c", input: { color: "#fff" }, borderRadius: 2 }}
        />

        {/* Reddit風：入力の下に重ねるポップオーバー */}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          transition
          style={{ zIndex: 1300, width: anchorWidth }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} timeout={120}>
              <Paper
                elevation={8}
                sx={{
                  bgcolor: "#1e1e1e",
                  color: "#fff",
                  borderRadius: 2,
                  mt: 1,
                  overflow: "hidden",
                }}
              >
                {loading && (
                  <Typography sx={{ p: 1.5, color: "#aaa" }}>検索中…</Typography>
                )}

                {!loading && communities.length > 0 && (
                  <Box sx={{ borderBottom: "1px solid #333" }}>
                    <Typography
                      sx={{ px: 1.5, pt: 1, pb: 0.5, fontSize: 12, color: "#90caf9" }}
                    >
                      コミュニティ
                    </Typography>
                    <List dense disablePadding sx={{ maxHeight: 240, overflowY: "auto" }}>
                      {communities.map((c) => (
                        <ListItemButton
                          key={c.objectID}
                          component={Link}
                          to={`/r/${c.slug ?? c.objectID}`}
                          onClick={() => setOpen(false)}
                          sx={{ py: 1 }}
                        >
                          <Avatar src={c.iconUrl} sx={{ width: 24, height: 24, mr: 1 }} />
                          <ListItemText
                            primary={`@${c.displayName ?? c.slug ?? "community"}`}
                            primaryTypographyProps={{ sx: { fontSize: 14 } }}
                            secondary={c.slug}
                            secondaryTypographyProps={{ sx: { fontSize: 12, color: "#aaa" } }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                )}

                {!loading && posts.length > 0 && (
                  <Box>
                    <Typography
                      sx={{ px: 1.5, pt: 1, pb: 0.5, fontSize: 12, color: "#90caf9" }}
                    >
                      投稿
                    </Typography>
                    <List dense disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
                      {posts.map((p) => (
                        <ListItemButton
                          key={p.objectID}
                          component={Link}
                          to={`/post/${p.objectID}/comments`}
                          onClick={() => setOpen(false)}
                          sx={{ py: 1 }}
                        >
                          <ListItemText
                            primary={p.title ?? "(無題)"}
                            primaryTypographyProps={{ sx: { fontSize: 14 } }}
                            secondary={(p.content ?? "").slice(0, 80)}
                            secondaryTypographyProps={{ sx: { fontSize: 12, color: "#aaa" } }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                )}

                {showEmpty && (
                  <Typography sx={{ p: 1.5, color: "#aaa" }}>結果がありません</Typography>
                )}
              </Paper>
            </Grow>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
