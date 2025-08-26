import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { DocumentData, Timestamp } from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Post as PostCard } from "../components/Post";
import { useAuth } from "../hooks/useAuth";
import { joinCommunity, leaveCommunity } from "../services/community";

// コミュニティ型
type Community = DocumentData & {
  id?: string;
  slug: string;
  name: string;
  displayName?: string;
  description?: string;
  iconUrl?: string;
  hostId?: string;
};

// 投稿型
type Post = DocumentData & {
  id: string;
  title?: string;
  content?: string;
  username?: string;
  avatarUrl?: string; 
  timestamp?: Timestamp;
  upvotes?: number;
};

export default function CommunityPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const cleanSlug = slug?.replace(/^@/, "");

    const fetchCommunity = async () => {
      if (!cleanSlug) return;
      const q = query(collection(db, "communities"), where("slug", "==", cleanSlug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const ref = querySnapshot.docs[0];
        const data = ref.data() as any;
        setCommunity({ id: ref.id, hostId: data.hostId, ...data } as Community);
      }
    };

    const fetchPosts = async () => {
      if (!cleanSlug) return;
      const q = query(
        collection(db, "posts"),
        where("communitySlug", "==", cleanSlug),
        orderBy("timestamp", "desc") // ← 新しい順
      );
      const querySnapshot = await getDocs(q);
      setPosts(
        querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Post)
        )
      );
    };

    fetchCommunity();
    fetchPosts();
  }, [slug]);

  // ユーザーのメンバーシップ状態をチェック
  useEffect(() => {
    const checkMembership = async () => {
      if (!user || !community) return;
      
      // ホストかどうかチェック
      if (community.hostId === user.uid) {
        setIsHost(true);
        setIsMember(true);
        return;
      }

      // メンバーかどうかチェック
      if (!community.id) return;
      const memberQuery = query(
        collection(db, "communities", community.id, "members"),
        where("userId", "==", user.uid)
      );
      const memberSnapshot = await getDocs(memberQuery);
      setIsMember(!memberSnapshot.empty);
    };

    checkMembership();
  }, [user, community]);

  if (!community) return <Typography sx={{ color: "#fff", p: 2 }}>Loading...</Typography>;

  const handleJoin = async () => {
    if (!user || !community || !community.id) return;
    
    setIsJoining(true);
    try {
      await joinCommunity(community.id, user.uid);
      setIsMember(true);
    } catch (error) {
      console.error('Failed to join community:', error);
      alert('コミュニティに参加できませんでした');
    } finally {
      setIsJoining(false);
    }
  };

  const doLeave = async () => {
    if (!user || !community || !community.id) return;
    setIsLeaving(true);
    try {
      await leaveCommunity(community.id, user.uid);
      setIsMember(false);
      setIsHost(false);
      setConfirmOpen(false);
    } catch (error) {
      console.error('Failed to leave community:', error);
      alert('コミュニティを離れることができませんでした');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2, color: "#fff" }}>
      {/* コミュニティヘッダー */}
      <Card sx={{ backgroundColor: "#1e1e1e", mb: 2, border: "1px solid #333" }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={community.iconUrl || undefined}
              alt={community.name}
              sx={{ width: 56, height: 56, bgcolor: "#555" }}
            >
              {community.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              @{community.displayName || community.name}
            </Typography>
          </Stack>

          {community.description && (
            <Typography variant="body2" sx={{ color: "#aaa", mt: 1 }}>
              {community.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {user && (
              <>
                {isHost ? (
                  <Chip 
                    label="ホスト" 
                    color="primary" 
                    variant="outlined"
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      backgroundColor: 'transparent',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      borderRadius: '12px',
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                ) : isMember ? (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={isLeaving}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {isLeaving ? '離脱中...' : '離脱する'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isJoining}
                    onClick={handleJoin}
                  >
                    {isJoining ? '参加中...' : '参加する'}
                  </Button>
                )}
              </>
            )}

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#ff4500",
                "&:hover": { backgroundColor: "#e03d00" },
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: "bold",
              }}
              onClick={() => navigate(`/r/${slug}/create-post`)}
            >
              ポスト
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 離脱確認ダイアログ */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>コミュニティを離脱しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            再参加しない限りメンバーではなくなります。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
          <Button color="error" variant="contained" onClick={doLeave} disabled={isLeaving}>
            {isLeaving ? '離脱中...' : '離脱する'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 投稿一覧 */}
      {posts.length === 0 ? (
        <Typography sx={{ color: "#aaa" }}>まだ投稿がありません</Typography>
      ) : (
        posts.map((post) => (
          <PostCard
          key={post.id}
          id={post.id}
          title={post.title || "(No title)"}
          content={post.content || ""}
          username={post.username || ""}
          avatarUrl={post.avatarUrl || ""}
          timestamp={
             post.timestamp
             ? post.timestamp.toDate().toLocaleString()
             : ""
         }
            upvotes={post.upvotes || 0}
        />

          
        ))
      )}
    </Box>
  );
}
