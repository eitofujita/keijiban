import app from "./app";
import { initializeIndexes } from "./services/meilisearch";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Initialize Meilisearch indexes
    await initializeIndexes();
    console.log('✅ Meilisearch indexes initialized');

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
