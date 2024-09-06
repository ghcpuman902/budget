'use client';
import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';
import { useSubscriptions } from './localStorageUtils';
import { columns } from '@/components/subscriptions/columns';
import { DataTable } from '@/components/subscriptions/components/DataTable';
import { Subscription, PartialSubscription, subscriptionSchema } from '@/components/subscriptions/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');
  const [input, setInput] = useState<string>(`Payment details
Vercel Inc.
Expected on the 23rd

£15.18
5 paymentsMonthly

Total £137.79

Paid from

HAO-TSUN KUO
Sort code:04-00-04Account number:45711660

Payment history

Vercel Inc.
Tue 27 Aug 2024
£15.18

Vercel Inc.
Fri 23 Aug 2024
£24.48

Vercel Inc.
Tue 23 Jul 2024
£24.84

Vercel Inc.
Sun 23 Jun 2024
£23.77

Vercel Inc.
Thu 23 May 2024
£25.19

Vercel Inc.
Tue 23 Apr 2024
£24.33`);

  const [partialSubscriptions, setPartialSubscriptions] = useState<PartialSubscription[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const { addSubscription } = useSubscriptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { object } = await generate(input);
      const fullSubscriptions: Subscription[] = [];
      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          const subscription: PartialSubscription = createPartialSubscription(partialObject);
          setPartialSubscriptions(prev => [...prev, subscription]);
          if (isFullSubscription(subscription)) {
            fullSubscriptions.push(subscription as Subscription);
            addSubscription(subscription as Subscription);
          }
        }
      }
      setSubscriptions(fullSubscriptions);
    } catch (error) {
      console.error("Error generating subscription:", error);
    }
  };

  const createPartialSubscription = (partialObject: any): PartialSubscription => {
    const subscription: PartialSubscription = {};
    for (const key of Object.keys(subscriptionSchema.shape)) {
      if (partialObject[key] !== undefined) {
        subscription[key as keyof Subscription] = partialObject[key];
      }
    }
    return subscription;
  };

  const isFullSubscription = (sub: PartialSubscription): sub is Subscription => {
    return subscriptionSchema.safeParse(sub).success;
  };

  return (
    <div className="p-4 rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full"
        />
        <Button type="submit" className="w-full">Generate Subscription</Button>
      </form>
      <pre className="mt-4 p-2 rounded">{generation}</pre>
      <h2 className="mt-6 text-xl font-semibold">Stored Subscriptions</h2>
      <DataTable columns={columns} data={partialSubscriptions} />
      {subscriptions.length > 0 && <DataTable columns={columns} data={subscriptions} />}
    </div>
  );
}