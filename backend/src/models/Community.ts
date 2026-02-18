import mongoose, { Schema, Document } from "mongoose";

export interface ICommunity extends Document {
  displayName: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  hostId: string;
  memberCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    iconUrl: {
      type: String,
    },
    hostId: {
      type: String,
      required: true,
    },
    memberCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Community = mongoose.model<ICommunity>("Community", CommunitySchema);

