'use client'

import { useState, useEffect, useRef } from 'react'
import { experimental_useObject as useObject } from 'ai/react'
import { v4 as uuidv4 } from 'uuid'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash2, PauseCircle, XCircle, DollarSign, HelpCircle } from 'lucide-react'
import { FaCcVisa, FaCcMastercard, FaPaypal, FaGreaterThan, FaCcAmex, FaGooglePay, FaApplePay } from 'react-icons/fa';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { AnimatedSaveButton } from '@/components/AnimatedSaveButton'
import { EditSubscriptionModal } from '@/components/EditSubscriptionModal'
import { subscriptionSchema, Subscription, getReadablePaymentMethod } from '@/components/subscriptions/types'
import { z } from 'zod'

const responseSchema = z.object({
  listOfSubscriptions: z.array(subscriptionSchema)
})

type ResponseData = z.infer<typeof responseSchema>

function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return dateObject instanceof Date && !isNaN(dateObject.getTime())
    ? dateObject.toISOString().split('T')[0]
    : '';
}

export default function RecurringPayments() {
  const [prompt, setPrompt] = useState(``)
  const [completeData, setCompleteData] = useState<(Subscription & { dealt: boolean })[]>([])
  const [partialData, setPartialData] = useState<(Subscription & { dealt: boolean })[]>([])
  const idMapRef = useRef<Map<string, string>>(new Map())

  const { isLoading, object: streamingData, submit, error } = useObject<ResponseData>({
    api: '/api/generate-recurring-payments',
    schema: responseSchema,
  })

  useEffect(() => {
    const savedData = localStorage.getItem('recurringPaymentsData')
    if (savedData) {
        const parsedData = JSON.parse(savedData)
      setCompleteData(parsedData)
      // try {
      //   const parsedData = JSON.parse(savedData)
      //   const migratedData = parsedData.map((subscription: any) => {
      //     // Migrate paymentMethod and paymentMethodDetails
      //     let paymentMethodDetails = subscription.paymentMethodDetails || {};
      //     if (subscription.paymentMethodDetails) {
      //       const { cardType, maskedCardNumber } = subscription.paymentMethodDetails;
      //       paymentMethodDetails = {
      //         type: getReadablePaymentMethod(cardType),
      //         details: maskedCardNumber ? `${cardType} ${maskedCardNumber}` : undefined
      //       };
      //     }
      //     return {
      //       ...subscription,
      //       paymentMethodDetails
      //     }
      //   })
      //   setCompleteData(migratedData)
      // } catch (error) {
      //   console.error("Error parsing saved data:", error)
      //   setCompleteData([])
      // }
    }
  }, [])

  useEffect(() => {
    if (streamingData?.listOfSubscriptions) {
      const subscriptionsWithConsistentIds = streamingData.listOfSubscriptions
        .filter((s): s is Subscription => !!s)
        .map(subscription => {
          const existingId = idMapRef.current.get(subscription.id)
          if (existingId) {
            return { ...subscription, id: existingId, dealt: false }
          }
          const newId = uuidv4()
          idMapRef.current.set(subscription.id, newId)
          return { ...subscription, id: newId, dealt: false }
        });
      setPartialData(subscriptionsWithConsistentIds);
    }
  }, [streamingData])

  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPartialData([])
    idMapRef.current.clear()
    await submit(prompt)
  }

  // Add this useEffect to move partialData to completeData when loading is done
  useEffect(() => {
    if (!isLoading && partialData.length > 0) {
      setCompleteData(prevData => [...prevData, ...partialData])
      setPartialData([])
    }
  }, [isLoading, partialData])

  const handleCheckboxChange = (id: string) => {
    setCompleteData(prevData =>
      prevData.map(sub =>
        sub.id === id ? { ...sub, dealt: !sub.dealt } : sub
      )
    )
  }

  const handleSave = () => {
    localStorage.setItem('recurringPaymentsData', JSON.stringify(completeData))
  }

  const handleClearStorage = () => {
    localStorage.removeItem('recurringPaymentsData')
    setCompleteData([])
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
  }

  const handleSaveEdit = (updatedSubscription: Subscription) => {
    setCompleteData(prevData =>
      prevData.map(sub => sub.id === updatedSubscription.id 
        ? { ...updatedSubscription, dealt: sub.dealt }
        : sub
      )
    )
    setEditingSubscription(null)
  }

  const handleDelete = (id: string) => {
    setCompleteData(prevData => prevData.filter(sub => sub.id !== id));
  };

  const displayData = [...completeData, ...partialData]

  const filteredData = displayData.filter(sub => {
    if (filter === 'all') return true
    if (filter === 'active') return sub.isActive
    if (filter === 'inactive') return !sub.isActive
    return true
  })

  const calculateTotalCost = (subscriptions: (Subscription & { dealt: boolean })[]) => {
    return subscriptions.reduce((sum, sub) => {
      if (!sub.isActive) return sum;

      const amount = typeof sub.amount === 'string'
        ? parseFloat(sub.amount.replace(/[^\d.-]/g, '')) || 0
        : typeof sub.amount === 'number' ? sub.amount : 0;

      let monthlyAmount = amount;
      switch (sub.frequency) {
        case 'annually':
          monthlyAmount = amount / 12;
          break;
        case 'quarterly':
          monthlyAmount = amount / 3;
          break;
        case 'weekly':
          monthlyAmount = amount * 4; // Approximate 4 weeks in a month
          break;
        // 'monthly' case is already handled by default
      }

      return sum + monthlyAmount;
    }, 0).toFixed(2);
  };

  const totalAmount = calculateTotalCost(filteredData);

  function getPaymentMethodIcon(type: string) {
    const iconMap: { [key: string]: JSX.Element } = {
      direct_debit: <FaMoneyBillTransfer className="inline-block w-4 h-4 mr-1" />,
      googlepay: <FaGooglePay className="inline-block w-4 h-4 mr-1" />,
      applepay: <FaApplePay className="inline-block w-4 h-4 mr-1" />,
      mastercard: <FaCcMastercard className="inline-block w-4 h-4 mr-1" />,
      card_paypal: <FaPaypal className="inline-block w-4 h-4 mr-1" />,
      bank_account_paypal: <FaPaypal className="inline-block w-4 h-4 mr-1" />,
      card_links: <FaGreaterThan className="inline-block w-4 h-4 mr-1" />,
      visa: <FaCcVisa className="inline-block w-4 h-4 mr-1" />,
      amex: <FaCcAmex className="inline-block w-4 h-4 mr-1" />,
      cancelled: <XCircle className="inline-block w-4 h-4 mr-1" />,
      paused: <PauseCircle className="inline-block w-4 h-4 mr-1" />,
      other: <HelpCircle className="inline-block w-4 h-4 mr-1" />
    }
    return iconMap[type] || <DollarSign className="inline-block w-4 h-4 mr-1" />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Payment Manager</CardTitle>
        <CardDescription>Manage your recurring payments and subscriptions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="prompt">Generate Subscriptions</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Customize your subscription list (e.g., 'Generate 5 monthly subscriptions for streaming services')"
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Creating Subscriptions...' : 'Generate Subscriptions'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter subscriptions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subscriptions</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <AnimatedSaveButton onSave={handleSave} disabled={isLoading} />
            <Button
              variant="destructive"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
                  handleClearStorage();
                }
              }}
            >
              Clear Saved Data
            </Button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error.message}</p>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="hidden md:table-cell">Billing Cycle</TableHead>
                <TableHead className="hidden lg:table-cell">Next Charge</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="hidden xl:table-cell">First Payment Date</TableHead>
                <TableHead className="hidden xl:table-cell">Expected End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((subscription, index) => {
                const isGenerating = index >= completeData.length;
                return (
                  <TableRow key={`${subscription?.id}-${index}`} className={isGenerating ? "animate-pulse" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={subscription?.dealt ?? false}
                        onCheckedChange={() => handleCheckboxChange(subscription.id)}
                        disabled={index >= completeData.length}
                      />
                    </TableCell>
                    <TableCell>{subscription?.name ?? ''}</TableCell>
                    <TableCell>{`${subscription?.amount ?? ''} ${subscription?.currency ?? ''}`}</TableCell>
                    <TableCell className="hidden md:table-cell">{subscription?.frequency ?? ''}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(subscription?.nextPaymentDate)}</TableCell>
                    <TableCell>
                      {getPaymentMethodIcon(subscription?.paymentMethodDetails?.type ?? '')}
                      {`${getReadablePaymentMethod(subscription?.paymentMethodDetails?.type ?? '')} ${subscription?.paymentMethodDetails?.details ? `(${subscription.paymentMethodDetails.details})` : ''}`}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">{formatDate(subscription?.firstPaymentDate)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{formatDate(subscription?.expectedEndDate)}</TableCell>
                    <TableCell>
                      {!isGenerating && (
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(subscription)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(subscription.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold">Total Monthly Cost: {totalAmount} {filteredData[0]?.currency}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button><PlusCircle className="h-4 w-4 mr-2" />Add Subscription</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
              </DialogHeader>
              {/* Add subscription form here */}
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <p className="mt-4 text-gray-600">Creating your personalized subscription list...</p>
        )}
      </CardContent>

      <EditSubscriptionModal
        subscription={editingSubscription}
        onSave={handleSaveEdit}
        onClose={() => setEditingSubscription(null)}
      />
    </Card>
  )
}