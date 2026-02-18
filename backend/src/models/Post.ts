import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  username: string;
  communitySlug: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  dislikes: number;
  comments: number;
  likedBy: string[];
  dislikedBy: string[];
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    communitySlug: {
      type: String,
      required: true,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
    dislikedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);

