import { MeiliSearch } from 'meilisearch';
import dotenv from "dotenv";

dotenv.config();

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY || 'masterKey',
});

export const meiliIndex = client.index('posts');
export const meiliCommunityIndex = client.index('communities');

// Initialize indexes if they don't exist
export async function initializeIndexes() {
  try {
    // Create posts index
    await client.createIndex('posts', { primaryKey: 'objectID' });
    console.log('Posts index created');
  } catch (error: any) {
    if (error.code !== 'index_already_exists') {
      console.error('Error creating posts index:', error);
    }
  }

  try {
    // Create communities index
    await client.createIndex('communities', { primaryKey: 'objectID' });
    console.log('Communities index created');
  } catch (error: any) {
    if (error.code !== 'index_already_exists') {
      console.error('Error creating communities index:', error);
    }
  }

  // Configure searchable attributes
  try {
    await meiliIndex.updateSearchableAttributes([
      'title',
      'content',
      'username',
      'communitySlug'
    ]);
    
    await meiliCommunityIndex.updateSearchableAttributes([
      'displayName',
      'slug',
      'description'
    ]);
  } catch (error) {
    console.error('Error configuring searchable attributes:', error);
  }
}
