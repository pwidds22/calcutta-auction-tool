/**
 * Broadcast Verification Script
 *
 * Tests whether the Supabase Realtime HTTP API broadcast reaches
 * a JS SDK WebSocket subscriber. Specifically tests whether the
 * `realtime:` prefix is required in the topic name.
 *
 * Run: npx tsx --env-file=.env.local scripts/test-broadcast.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error('Missing environment variables. Run with: npx tsx --env-file=.env.local scripts/test-broadcast.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const testId = `test-${Date.now()}`;
const channelName = `auction:${testId}`;

let receivedWithPrefix = false;
let receivedWithoutPrefix = false;

async function httpBroadcast(topic: string, event: string, payload: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/realtime/v1/api/broadcast`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ topic, event, payload }],
    }),
  });
  console.log(`  HTTP broadcast to topic "${topic}" -> status ${res.status}`);
  if (!res.ok) {
    console.error('  Response:', await res.text());
  }
}

console.log('=== Supabase Broadcast Verification ===');
console.log(`Channel name: ${channelName}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log('');

const channel = supabase.channel(channelName, {
  config: { broadcast: { self: true } },
});

channel
  .on('broadcast', { event: 'TEST_WITH_PREFIX' }, ({ payload }) => {
    console.log('  RECEIVED "TEST_WITH_PREFIX":', payload);
    receivedWithPrefix = true;
  })
  .on('broadcast', { event: 'TEST_WITHOUT_PREFIX' }, ({ payload }) => {
    console.log('  RECEIVED "TEST_WITHOUT_PREFIX":', payload);
    receivedWithoutPrefix = true;
  })
  .subscribe(async (status) => {
    console.log(`Subscription status: ${status}`);

    if (status === 'SUBSCRIBED') {
      console.log('');

      // Test 1: Send with realtime: prefix (current broadcast.ts behavior)
      console.log('Test 1: Broadcasting with "realtime:" prefix...');
      await httpBroadcast(
        `realtime:${channelName}`,
        'TEST_WITH_PREFIX',
        { format: 'realtime:channelName', ts: Date.now() }
      );

      // Wait 3 seconds then test without prefix
      setTimeout(async () => {
        console.log('');
        console.log('Test 2: Broadcasting WITHOUT "realtime:" prefix...');
        await httpBroadcast(
          channelName,
          'TEST_WITHOUT_PREFIX',
          { format: 'channelName', ts: Date.now() }
        );
      }, 3000);

      // Report results after 7 seconds
      setTimeout(async () => {
        console.log('');
        console.log('=== RESULTS ===');
        console.log(`With "realtime:" prefix:    ${receivedWithPrefix ? 'RECEIVED' : 'NOT received'}`);
        console.log(`Without "realtime:" prefix: ${receivedWithoutPrefix ? 'RECEIVED' : 'NOT received'}`);
        console.log('');

        if (receivedWithPrefix && !receivedWithoutPrefix) {
          console.log('VERDICT: Current broadcast.ts is CORRECT (realtime: prefix required)');
        } else if (!receivedWithPrefix && receivedWithoutPrefix) {
          console.log('VERDICT: broadcast.ts needs FIX — remove "realtime:" prefix from topic');
        } else if (receivedWithPrefix && receivedWithoutPrefix) {
          console.log('VERDICT: Both formats work. Current code is fine.');
        } else {
          console.log('VERDICT: NEITHER format worked. Deeper investigation needed.');
          console.log('Check: Supabase Realtime enabled? Service role key correct? Network issues?');
        }

        await channel.unsubscribe();
        process.exit(0);
      }, 7000);
    }
  });

// Safety timeout
setTimeout(() => {
  console.error('Timed out after 15 seconds. Could not subscribe to channel.');
  process.exit(1);
}, 15000);
