import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
