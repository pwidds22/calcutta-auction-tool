'use server';

/**
 * Server-side broadcast to a Supabase Realtime channel.
 * Uses the Realtime HTTP API since server actions run in serverless
 * functions without persistent WebSocket connections.
 */
export async function broadcastToChannel(
  channelName: string,
  event: string,
  payload: Record<string, unknown>
) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    body: JSON.stringify({
      messages: [
        {
          topic: channelName,
          event,
          payload,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error('Broadcast failed:', res.status, await res.text());
  }
}
