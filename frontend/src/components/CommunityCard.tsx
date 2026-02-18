import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import Group from '@mui/icons-material/Group';
import MoreVert from '@mui/icons-material/MoreVert';
import Person from '@mui/icons-material/Person';
import ExitToApp from '@mui/icons-material/ExitToApp';
import TransferWithinAStation from '@mui/icons-material/TransferWithinAStation';
import Delete from '@mui/icons-material/Delete';
import { Community, joinCommunity, leaveCommunity } from '../services/community';
import { useAuth } from '../hooks/useAuth';

interface CommunityCardProps {
  community: Community;
  onUpdate?: () => void;
  showManageOptions?: boolean;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  onUpdate,
  showManageOptions = false 
}) => {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);

  // Check if user is host
  React.useEffect(() => {
    if (user && community.hostId === user.uid) {
      setIsHost(true);
    }
  }, [user, community.hostId]);

  const handleJoin = async () => {
    if (!user) return;
    
    setIsJoining(true);
    try {
      await joinCommunity(community.objectID, user.uid);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to join community:', error);
      alert('コミュニティに参加できませんでした');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    
    setIsLeaving(true);
    try {
      await leaveCommunity(community.objectID, user.uid);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to leave community:', error);
      alert('コミュニティを離れることができませんでした');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };





  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch (error) {
      return '不明';
    }
  };

  return (
    <Card sx={{ mb: 2, maxWidth: 600 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              src={community.iconUrl} 
              sx={{ width: 56, height: 56 }}
            >
              {community.displayName?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                r/{community.displayName || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {community.memberCount || 0} メンバー • {community.createdAt ? formatDate(community.createdAt) : '不明'}作成
              </Typography>
            </Box>
          </Box>
          
          {showManageOptions && isHost && (
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {community.description || '説明なし'}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Chip 
            icon={<Group />} 
            label={`${community.memberCount || 0} メンバー`} 
            size="small" 
            variant="outlined"
          />
          {isHost && (
            <Chip 
              icon={<Person />} 
              label="ホスト" 
              size="small" 
              color="primary"
            />
          )}
        </Box>

        {user && (
          <Box display="flex" gap={1}>
            {isHost ? (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<ExitToApp />}
                disabled={isLeaving}
                onClick={handleLeave}
              >
                {isLeaving ? '処理中...' : 'コミュニティを削除'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Group />}
                disabled={isJoining}
                onClick={handleJoin}
              >
                {isJoining ? '参加中...' : '参加する'}
              </Button>
            )}
          </Box>
        )}
        {!user && (
          <Box display="flex" gap={1}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Group />}
              disabled={true}
            >
              ログインして参加
            </Button>
          </Box>
        )}

        {/* Management Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleMenuClose()}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText>メンバー管理</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // TODO: Show dialog to select new host
            console.log('Transfer ownership clicked');
            handleMenuClose();
          }}>
            <ListItemIcon>
              <TransferWithinAStation />
            </ListItemIcon>
            <ListItemText>所有権移譲</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose()}>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText>コミュニティ削除</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};
