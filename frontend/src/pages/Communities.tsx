import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import { CommunityCard } from '../components/CommunityCard';
import { getAllCommunities, Community } from '../services/community';
import { useAuth } from '../hooks/useAuth';

export const Communities: React.FC = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await getAllCommunities();
      setCommunities(data);
      setFilteredCommunities(data);
    } catch (err) {
      setError('コミュニティの取得に失敗しました');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    const filtered = communities.filter(community =>
      (community.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (community.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredCommunities(filtered);
  }, [searchTerm, communities]);

  const handleCreateCommunity = () => {
    // TODO: Navigate to create community page
    console.log('Navigate to create community');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          コミュニティ
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCommunity}
          >
            コミュニティを作成
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="コミュニティを検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredCommunities.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? '検索結果が見つかりませんでした' : 'コミュニティがありません'}
          </Typography>
        </Box>
      ) : (
        <Box>
          {filteredCommunities.map((community) => (
            <CommunityCard
              key={community.objectID}
              community={community}
              onUpdate={fetchCommunities}
              showManageOptions={true}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};
