export const moderateMessage = async (text) => {
  const res = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("Moderation API failed");
  }

  return res.json(); // returns { status, original, rephrased, score, ... }
};
