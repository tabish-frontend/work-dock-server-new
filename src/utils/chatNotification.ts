import { NotificationModel, PushSubscriptionModel } from "../models";
import { getReceiverSocketId, io } from "../index";
import webPush from ".././config/webPushConfig";

// Function to send notifications without any cooldown
export const sendChatNotification = async (
  sender: any, // The user sending the message
  threadId: string,
  recipientIds: string[], // Array of user IDs to receive the notification
  contentType: string
) => {
  // Notify all recipients
  for (const recipientId of recipientIds) {
    let notificationMessage = "";
    let generateLink = "";
    let targetLink = "";
    // /chat?threadKey=${thread._id}

    // Check if the content type is "call"
    if (contentType === "call") {
      notificationMessage =
        recipientIds.length > 1
          ? "starting a video call in Group Chat click here to join"
          : "starting a video call in Chat click here to join";

      generateLink = "click here to join";
      targetLink = `/chat/room?threadKey=${threadId}`;
    } else {
      notificationMessage =
        recipientIds.length > 1
          ? "has sent you a message in Group Chat"
          : "has sent you a message.";

      generateLink = "message";
      targetLink = `/chat?threadKey=${threadId}`;
    }

    const newNotification = await NotificationModel.create({
      sender: sender._id,
      receiver: recipientId,
      message: notificationMessage,
      link: generateLink,
      target_link: targetLink,
    });

    // Emit the notification to the recipient's socket if they are online
    const receiverSocketId = getReceiverSocketId(recipientId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveNotification", newNotification);
    }

    const subscribeUser = await PushSubscriptionModel.find({
      user: recipientId,
    });

    // Create the push notification message
    const pushNotificationMessage = `${sender.full_name} ${notificationMessage}`;

    const payload = JSON.stringify({
      title: `New Message from ${sender.full_name}`,
      message: pushNotificationMessage,
      icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
      url: targetLink,
    });

    for (const subscription of subscribeUser) {
      try {
        await webPush.sendNotification(subscription, payload);
      } catch (error: any) {
        console.error("Error sending push notification:", error);
      }
    }
  }
};
