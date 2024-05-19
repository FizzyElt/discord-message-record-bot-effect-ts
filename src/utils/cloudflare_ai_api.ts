import { Effect } from "effect";

export const fetchLlama = ({
  accountId,
  token,
  content,
}: { accountId: string; token: string; content: string }) => {
  const request = new Request(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-fp16`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ prompt: content }),
    },
  );

  return Effect.tryPromise(() =>
    fetch(request)
      .then((res) => res.json())
      .then((res) => res.result.response as string)
      .catch(() => "cloudflare err"),
  );
};
