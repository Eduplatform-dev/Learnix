import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
