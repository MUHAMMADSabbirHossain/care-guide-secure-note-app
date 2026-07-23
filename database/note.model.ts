// database/note.model.ts
import mongoose, { Schema } from "mongoose";

const NoteSchema = new Schema(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Explicit indexes (visible in code review)
NoteSchema.index({ userId: 1 });
NoteSchema.index({ createdAt: -1 });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
