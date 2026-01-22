export const moderateMessage = async (text) => {
  const res = await fetch("http://127.0.0.1:8000/moderate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("Moderation API failed");
  }

  return res.json(); // returns { status, original, rephrased, score, ... }
};
