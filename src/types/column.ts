import mongoose from "mongoose";

export interface Column extends Document {
  name: string;
  board: mongoose.Types.ObjectId;
  tasks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
