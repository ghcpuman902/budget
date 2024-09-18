import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { subscriptionSchema } from '@/components/subscriptions/types'; // Import subscriptionSchema

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export const runtime = 'edge';

const responseSchema = z.object({
  listOfSubscriptions: z.array(subscriptionSchema)
});

export async function POST(req: Request) {
  const prompt = await req.json();
  // console.log(prompt);
  const result = await streamObject({
    model: openai('gpt-4o'),
    schema: responseSchema,
    prompt: `Generate an object with a 'listOfSubscriptions' property containing recurring payment entries following user prompt:\n${prompt}`,
  });

  return result.toTextStreamResponse();
}