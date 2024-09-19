"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeeting = exports.getAllMeetings = exports.createMeeting = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.createMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, time, participants } = req.body;
    const owner = req.user._id;
    const newMeeting = yield models_1.MeetingModel.create({
        title,
        time,
        participants,
        owner,
    });
    const populatedMeetings = yield models_1.MeetingModel.findById(newMeeting._id)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedMeetings, "Meeting Created Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllMeetings = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    const userId = req.user._id;
    let filter = {};
    // Determine filter based on the status
    if (status === "upcoming") {
        filter = { time: { $gte: new Date() } };
    }
    else if (status === "completed") {
        filter = { time: { $lt: new Date() } };
    }
    // Add condition to check if the user is the owner or a participant
    filter = Object.assign(Object.assign({}, filter), { $or: [
            { owner: userId },
            { participants: userId }, // Check if the user is a participant
        ] });
    // Find meetings with the updated filter and populate references
    const meetings = yield models_1.MeetingModel.find(filter)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar")
        .sort({ time: 1 });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, meetings, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("API hitting");
    const { id } = req.params;
    // Find the meeting by its _id and populate owner and participants
    const meetings = yield models_1.MeetingModel.findById(id)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar")
        .sort({ time: 1 });
    if (!meetings) {
        throw new utils_1.AppError("", 409);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, meetings, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=meetingController.js.map