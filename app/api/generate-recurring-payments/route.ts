import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const runtime = 'edge';

const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.literal("GBP"),
  startDate: z.string(),
  frequency: z.union([
    z.literal("weekly"),
    z.literal("monthly"),
    z.literal("quarterly"),
    z.literal("annually")
  ]),
  nextPaymentDate: z.string(),
  paymentMethod: z.union([
    z.literal("direct_debit"),
    z.literal("credit_card"),
    z.literal("debit_card"),
    z.literal("paypal")
  ]),
  bankHolidays: z.array(z.string()).optional(),
  paymentRules: z.object({
    skipHolidays: z.boolean(),
    weekendAdjustment: z.union([
      z.literal("before"),
      z.literal("after"),
      z.literal("none")
    ])
  }).optional(),
  isActive: z.boolean(),
  isCancelled: z.boolean()
});

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