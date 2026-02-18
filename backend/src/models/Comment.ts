import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  text: string;
  username: string;
  userId: string;
  postId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  avatarUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
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
    likedBy: {
      type: [String],
      default: [],
    },
    dislikedBy: {
      type: [String],
      default: [],
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// インデックスを追加してクエリを最適化
CommentSchema.index({ postId: 1, parentId: 1 });
CommentSchema.index({ postId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
