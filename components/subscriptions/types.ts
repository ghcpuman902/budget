import { z } from 'zod';

export const subscriptionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    amount: z.union([z.string(), z.number()]),
    currency: z.literal("GBP"),
    startDate: z.string(),
    frequency: z.union([
        z.literal("weekly"),
        z.literal("monthly"),
        z.literal("quarterly"),
        z.literal("annually")
    ]),
    nextPaymentDate: z.string(),
    paymentMethodDetails: z.object({
        type: z.enum([
            "direct_debit",
            "cancelled",
            "paused",
            "bank_account_paypal",
            "card_paypal",
            "card_links",
            "googlepay",
            "applepay",
            "mastercard",
            "paypal",
            "visa",
            "klarna",
            "afterpay",
            "amex",
            "other"
        ]),
        details: z.string().optional(),
    }),
    firstPaymentDate: z.string(),
    expectedEndDate: z.string().optional(),
    pastPayments: z.array(z.object({
        date: z.string(),
        amount: z.number()
    })).optional(),
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

// Utility functions
const paymentMethodEnum = subscriptionSchema.shape.paymentMethodDetails.shape.type.options;

const paymentMethodMap: { [key: string]: string } = paymentMethodEnum.reduce((acc, method) => {
  acc[method] = method
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
  return acc;
}, {} as { [key: string]: string });

export function getReadablePaymentMethod(type: string): string {
  return paymentMethodMap[type] || type;
}

export const paymentMethodOptions = paymentMethodEnum;