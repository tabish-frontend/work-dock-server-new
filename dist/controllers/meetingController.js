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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.updateMeeting = exports.getMeeting = exports.getAllMeetings = exports.createMeeting = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
const webPushConfig_1 = __importDefault(require("../config/webPushConfig"));
const index_1 = require("../index");
exports.createMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, time, participants } = req.body;
    const owner = req.user;
    const newMeeting = yield models_1.MeetingModel.create({
        title,
        time,
        participants,
        owner: owner._id,
    });
    const populatedMeetings = yield models_1.MeetingModel.findById(newMeeting._id)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar");
    let notificationMessage = `invited you in a ${title} meeting at ${time}`;
    const receiver = participants.map((item) => item._id);
    const newNotification = yield models_1.NotificationModel.create({
        sender: owner._id,
        receiver,
        message: notificationMessage,
        link: title,
        time: time,
        target_link: `/meetings`,
    });
    const populatedNotification = yield models_1.NotificationModel.findById(newNotification._id).populate("sender", "full_name avatar");
    receiver.forEach((recipientId) => {
        const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("receiveNotification", populatedNotification);
        }
    });
    const subscriptions = yield models_1.PushSubscriptionModel.find({
        user: { $in: participants },
    });
    const pushNotificationMessage = `${owner.full_name} ${notificationMessage}`;
    // Send push notification
    subscriptions.forEach((subscription) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = JSON.stringify({
            title: `Meeting: ${title}`,
            message: pushNotificationMessage,
            icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
            url: `/meetings`, // URL to navigate on notification click
        });
        try {
            yield webPushConfig_1.default.sendNotification(subscription, payload);
        }
        catch (error) {
            console.log("error", error);
        }
    }));
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedMeetings, "Meeting Created Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllMeetings = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    const userId = req.user._id;
    let filter = {};
    // Get the current time and subtract 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    // Determine filter based on the status
    if (status === "upcoming") {
        // Set filter to get meetings that are scheduled after two hours ago, i.e., upcoming
        filter = { time: { $gte: twoHoursAgo } };
    }
    else if (status === "completed") {
        // Get the current time and subtract 2 hours
        filter = { time: { $lt: twoHoursAgo } };
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
        .sort({ time: status === "upcoming" ? 1 : -1 });
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
exports.updateMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedData = req.body;
    // Find the meeting by id and update with new data
    const updatedMeeting = yield models_1.MeetingModel.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true, // Ensure validation rules are respected
    })
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar");
    // Check if meeting exists
    if (!updatedMeeting) {
        throw new utils_1.AppError("Meeting not found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedMeeting, "Meeting Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Find the meeting by id and remove it
    const meeting = yield models_1.MeetingModel.findByIdAndDelete(id);
    // Check if meeting exists
    if (!meeting) {
        throw new utils_1.AppError("No Meeting found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Meeting Deleted Successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=meetingController.js.map