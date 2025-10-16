import mongoose from "mongoose";

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed"],
      default: "todo",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
;
