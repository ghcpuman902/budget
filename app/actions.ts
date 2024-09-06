// app/actions.ts
'use server';
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

const SubscriptionSchema = z.object({
  id: z.string().uuid(),  // Unique identifier for the subscription
  name: z.string().min(1), // Name of the subscription
  description: z.string().nullable(), // Optional description of the subscription
  amount: z.number().positive(), // Payment amount in GBP
  currency: z.enum(["GBP"]).default("GBP"), // Currency set to GBP by default
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)), 
    { message: "Invalid date format" }
  ), // Start date of the subscription
  frequency: z.enum(["weekly", "monthly", "quarterly", "annually"]), // Frequency of payments
  nextPaymentDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)), 
    { message: "Invalid date format" }
  ), // Calculated or manually set next payment date
  paymentMethod: z.enum(["direct_debit", "credit_card", "debit_card", "paypal"]), // Payment method
  bankHolidays: z.array(z.string()).nullable(), // Optional list of custom bank holidays (ISO date strings)
  paymentRules: z.object({
    skipHolidays: z.boolean().default(true), // Option to skip bank holidays
    weekendAdjustment: z.enum(["before", "after", "none"]).default("before"), // Adjust for weekends
  }).nullable(), // Optional payment rules object
  isActive: z.boolean().default(true), // Whether the subscription is active or not
  isCancelled: z.boolean().default(false), // Whether the user has taken action to cancel the subscription
});

export async function generate(input: string) {
  'use server';
  const stream = createStreamableValue();
  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai('gpt-4o'),
      system: 'Generate array of subscription objects based on the user input.',
      prompt: input,
      schema: SubscriptionSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }
    stream.done();
  })();
  return { object: stream.value };
}