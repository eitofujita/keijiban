import app from "./app";
import { initializeIndexes } from "./services/meilisearch";
import { connectDB } from "./services/db";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');

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
