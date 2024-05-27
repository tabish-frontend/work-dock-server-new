import mongoose, { Schema } from "mongoose";
import { Attendance } from "../types";
import { AttendanceStatus } from "../utils";

const attendanceSchema: Schema<Attendance> = new Schema<Attendance>(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        AttendanceStatus.FULL_DAY_PRESENT,
        AttendanceStatus.FULL_DAY_ABSENT,
        AttendanceStatus.SHORT_ATTENDANCE,
        AttendanceStatus.ONLINE,
        AttendanceStatus.HALF_DAY_PRESENT,
      ],
      required: true,
    },
    timeIn: { type: Date, required: false },
    timeOut: { type: Date, default: "", required: false },
    duration: { type: Number, default: 0 },
    notes: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const AttendanceModal = mongoose.model("Attendance", attendanceSchema);
