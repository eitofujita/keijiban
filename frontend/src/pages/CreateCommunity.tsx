import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { createCommunity } from '../services/community';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const CreateCommunity: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    description: '',
    iconUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from display name
    if (name === 'displayName') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 21); // Reddit's limit
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('ログインが必要です');
      return;
    }

    if (!formData.displayName || !formData.slug || !formData.description) {
      setError('すべての必須フィールドを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCommunity({
        ...formData,
        hostId: user.uid
      });
      
      setSuccess(true);
      setFormData({
        displayName: '',
        slug: '',
        description: '',
        iconUrl: ''
      });

      // 作成後にコミュニティ一覧へ遷移
      navigate('/communities');
    } catch (err) {
      setError('コミュニティの作成に失敗しました');
      console.error('Error creating community:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // TODO: Navigate back
    console.log('Navigate back');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          戻る
        </Button>
        <Typography variant="h4" component="h1">
          コミュニティを作成
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            コミュニティが正常に作成されました！
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="コミュニティ名"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            helperText="コミュニティの表示名を入力してください"
          />

          <TextField
            fullWidth
            label="スラッグ"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            helperText="URLで使用される短い名前（自動生成されます）"
            inputProps={{
              maxLength: 21
            }}
          />

          <TextField
            fullWidth
            label="説明"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={3}
            sx={{ mb: 2 }}
            helperText="コミュニティの説明を入力してください"
          />

          <TextField
            fullWidth
            label="アイコンURL（オプション）"
            name="iconUrl"
            value={formData.iconUrl}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
            helperText="コミュニティアイコンの画像URL"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? '作成中...' : 'コミュニティを作成'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};
