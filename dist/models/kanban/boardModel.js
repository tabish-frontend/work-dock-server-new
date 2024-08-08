"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BoardSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    columns: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Column" }],
    tasks: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Task" }],
    workspace: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
}, { timestamps: true });
// Middleware to delete columns and tasks when a board is deleted
// BoardSchema.pre('findOneAndDelete', async function(next) {
//   const board = await this.model.findOne(this.getQuery());
//   if (!board) return next();
//   // Delete all tasks related to the board
//   await TaskModel.deleteMany({ column: { $in: board.columns } });
//   // Delete all columns
//   await ColumnModel.deleteMany({ _id: { $in: board.columns } });
//   next();
// });
exports.BoardModel = mongoose_1.default.model("Board", BoardSchema);
//# sourceMappingURL=boardModel.js.map