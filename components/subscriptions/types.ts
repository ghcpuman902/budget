import { z } from 'zod';

export const subscriptionSchema = z.object({
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

export type Subscription = z.infer<typeof subscriptionSchema>;
export type PartialSubscription = Partial<Subscription>;