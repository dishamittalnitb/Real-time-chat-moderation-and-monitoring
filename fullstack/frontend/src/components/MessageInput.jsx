

import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";


/* 🔹 Moderation API helper */
const moderateText = async (text) => {
  const res = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("Moderation API failed");
  return res.json();
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [moderation, setModeration] = useState(null);
  const [checking, setChecking] = useState(false);

  /* 🔘 Moderation toggle */
  const [moderationEnabled, setModerationEnabled] = useState(true);

  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  /* ---------- Persist moderation toggle ---------- */

  useEffect(() => {
    const saved = localStorage.getItem("moderationEnabled");
    if (saved !== null) setModerationEnabled(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("moderationEnabled", moderationEnabled);
  }, [moderationEnabled]);

  /* ---------- Image logic ---------- */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setText("");
    setImagePreview(null);
    setModeration(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------- SEND MESSAGE ---------- */

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    // 🖼️ Image-only
    if (!text.trim() && imagePreview) {
      await sendMessage({ text: "", image: imagePreview, status: "unmoderated" });
      resetForm();
      return;
    }

    // 🔕 Moderation OFF
    if (!moderationEnabled) {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        status: "unmoderated",
      });
      resetForm();
      return;
    }

    // 🛡️ Moderation ON
    try {
      setChecking(true);
      const result = await moderateText(text.trim());
      setChecking(false);

      if (result.status === "blocked") {
        toast.error(
          `Message blocked: ${result.reason} • Score: ${result.score}`
        );
        return;
      }

       
      


      if (result.status === "approved") {
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
          status: "approved",
          toxicityScore: result.score,
        });
        resetForm();
        return;
      }

      if (result.status === "rephrased") {
        setModeration(result);
      }
    } catch (error) {
      setChecking(false);
      toast.error("Moderation service unavailable");
      console.error(error);
    }
  };

  /* ---------- SEND REPHRASED ---------- */

  const sendRephrasedMessage = async () => {
    await sendMessage({
      text: moderation.rephrased,
      image: imagePreview,
      status: "rephrased",
      toxicityScore: moderation.score,
    });

    resetForm();
  };

  /* ---------- UI ---------- */

  return (
    <div className="p-4 w-full">

      {/* 🔘 Moderation Toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">
          Chat Moderation
        </span>

        <button
          type="button"
          onClick={() => setModerationEnabled((prev) => !prev)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-300
            ${moderationEnabled ? "bg-emerald-500" : "bg-zinc-400"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
              transition-transform duration-300
              ${moderationEnabled ? "translate-x-5" : ""}`}
          />
        </button>
      </div>

      {/* 🖼️ Image preview */}
      {imagePreview && (
        <div className="mb-3">
          <div className="relative w-20">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ Rephrase popup */}
      {moderation?.status === "rephrased" && (
        <div className="relative mb-3 p-3 rounded border bg-yellow-50">
          <button
            onClick={() => setModeration(null)}
            type="button"
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
          >
            <X size={16} />
          </button>

          <p className="text-sm text-red-800 font-semibold pr-6">
            ⚠ Message rephrased ({moderation.reason} • Score: {moderation.score})
          </p>

          <p className="mt-1 text-gray-800 font-medium">
            {moderation.rephrased}
          </p>

          <button
            onClick={sendRephrasedMessage}
            type="button"
            className="mt-2 btn btn-sm btn-success"
          >
            Send Rephrased
          </button>
        </div>
      )}

      {/* 💬 Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (moderation) setModeration(null);
            }}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
              ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={checking || (!text.trim() && !imagePreview)}
        >
          {checking ? "…" : <Send size={22} />}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
