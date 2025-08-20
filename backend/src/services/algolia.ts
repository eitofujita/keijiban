import algoliasearch from "algoliasearch";
import dotenv from "dotenv";

dotenv.config();

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

export const algoliaIndex = client.initIndex(process.env.ALGOLIA_INDEX_NAME!);
