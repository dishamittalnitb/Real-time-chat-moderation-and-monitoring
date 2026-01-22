import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
    },
    image: {
      type: String,
    },

    // 🔹 MODERATION FIELDS (NEW)
    status: {
      type: String,
      enum: ["approved", "rephrased", "unmoderated" , "blocked"],
      default: "unmoderated",
    },
    toxicityScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
