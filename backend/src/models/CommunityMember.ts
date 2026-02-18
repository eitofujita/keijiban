import mongoose, { Schema, Document } from "mongoose";

export interface ICommunityMember extends Document {
  communityId: mongoose.Types.ObjectId;
  userId: string;
  role: 'host' | 'member';
  joinedAt: Date;
}

const CommunityMemberSchema = new Schema<ICommunityMember>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['host', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// 複合インデックスでユーザーが同じコミュニティに複数回参加できないようにする
CommunityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

export const CommunityMember = mongoose.model<ICommunityMember>("CommunityMember", CommunityMemberSchema);

