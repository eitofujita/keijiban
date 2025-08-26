# Meilisearch セットアップガイド

このプロジェクトでは、Algoliaの代わりにMeilisearchを使用して検索機能を実装しています。

## 前提条件

- Docker と Docker Compose がインストールされていること
- Node.js と npm がインストールされていること

## セットアップ手順

### 1. Meilisearch サーバーの起動

```bash
# プロジェクトルートで実行
docker-compose up -d meilisearch
```

これで Meilisearch が `http://localhost:7700` で起動します。

### 2. バックエンドの環境設定

```bash
# backend ディレクトリに移動
cd reddit-clone/backend

# 環境変数ファイルを作成
cp env.example .env
```

`.env` ファイルの内容を確認し、必要に応じて調整してください：

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# Meilisearch Configuration
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=dev_master_key
```

### 3. バックエンドの依存関係をインストール

```bash
# backend ディレクトリで実行
npm install
```

### 4. バックエンドサーバーの起動

```bash
# 開発モードで起動
npm run dev

# または本番ビルドして起動
npm run build
npm start
```

## 機能

### 検索機能

- **投稿検索**: タイトル、内容、ユーザー名、コミュニティで検索
- **コミュニティ検索**: 表示名、スラッグ、説明で検索
- **リアルタイム検索**: 入力に応じてリアルタイムで結果を表示

### インデックス管理

- **自動インデックス作成**: サーバー起動時に自動的にインデックスを作成
- **投稿の自動インデックス**: 投稿作成・更新・削除時に自動的にインデックスを更新
- **コミュニティの自動インデックス**: コミュニティ作成・更新・削除時に自動的にインデックスを更新

## API エンドポイント

### 検索

```
GET /search?q={検索クエリ}&limit={結果数}
```

### 投稿管理

```
POST /posts - 投稿作成
PATCH /posts/:id - 投稿更新
DELETE /posts/:id - 投稿削除
GET /posts/search?q={検索クエリ} - 投稿検索
```

## Meilisearch 管理画面

Meilisearch の管理画面にアクセスするには：

1. ブラウザで `http://localhost:7700` にアクセス
2. マスターキーとして `dev_master_key` を入力

管理画面では以下が可能です：
- インデックスの確認
- ドキュメントの管理
- 検索設定の調整
- 統計情報の確認

## トラブルシューティング

### Meilisearch が起動しない場合

```bash
# ログを確認
docker-compose logs meilisearch

# コンテナを再起動
docker-compose restart meilisearch
```

### インデックスが作成されない場合

1. Meilisearch が正常に起動しているか確認
2. バックエンドの環境変数が正しく設定されているか確認
3. バックエンドサーバーのログを確認

### 検索が動作しない場合

1. フロントエンドの環境変数 `VITE_API_BASE_URL` が正しく設定されているか確認
2. バックエンドサーバーが起動しているか確認
3. CORS設定が正しいか確認

## パフォーマンス最適化

### インデックス設定

Meilisearch のインデックス設定は `src/services/meilisearch.ts` で管理されています：

```typescript
// 検索可能な属性を設定
await meiliIndex.updateSearchableAttributes([
  'title',
  'content', 
  'username',
  'communitySlug'
]);
```

### 検索結果の制限

デフォルトでは最大50件まで検索結果を返します。これは `searchController.ts` で設定されています：

```typescript
const searchLimit = Math.min(parseInt(limit as string) || 10, 50);
```

## 開発時の注意点

1. **データの永続化**: 現在はメモリベースのモックデータベースを使用しています。本番環境では適切なデータベースに置き換えてください。

2. **エラーハンドリング**: 検索エラーやインデックスエラーは適切にログ出力されます。

3. **セキュリティ**: 本番環境では適切なマスターキーを設定し、アクセス制御を実装してください。
