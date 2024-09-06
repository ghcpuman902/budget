'use client'

import { useState, useEffect, useRef } from 'react'
import { experimental_useObject as useObject } from 'ai/react'
import { z } from 'zod'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { v4 as uuidv4 } from 'uuid'
import { subscriptionSchema, Subscription } from '@/components/subscriptions/types'
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react'

const responseSchema = z.object({
  listOfSubscriptions: z.array(subscriptionSchema)
})

type ResponseData = z.infer<typeof responseSchema>

export default function RecurringPayments() {
  const [prompt, setPrompt] = useState(`Generate an object with a 'listOfSubscriptions' property containing 10 recurring payment entries.`)
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
      setCompleteData(JSON.parse(savedData))
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

  useEffect(() => {
    if (!isLoading && partialData.length > 0) {
      setCompleteData(prevData => [...prevData, ...partialData])
      setPartialData([])
    }
  }, [isLoading, partialData])

  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPartialData([])
    idMapRef.current.clear()
    await submit(prompt)
  }

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

  const filteredData = completeData.filter(sub => {
    if (filter === 'all') return true
    if (filter === 'active') return sub.isActive
    if (filter === 'inactive') return !sub.isActive
    return true
  })

  const totalAmount = filteredData.reduce((sum, sub) => sum + (sub.amount || 0), 0)

  const displayData = [...completeData, ...partialData]

  return (
    <Card className="w-full max-w-4xl mx-auto">
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
            <Button onClick={handleSave} disabled={isLoading || partialData.length > 0}>
              Save Progress
            </Button>
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
                <TableHead className="hidden sm:table-cell">Billing Cycle</TableHead>
                <TableHead className="hidden sm:table-cell">Next Charge</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((subscription, index) => (
                <TableRow key={`${subscription?.id}-${index}`} className={index >= completeData.length ? "animate-pulse" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={subscription?.dealt ?? false}
                      onCheckedChange={() => handleCheckboxChange(subscription.id)}
                      disabled={index >= completeData.length}
                    />
                  </TableCell>
                  <TableCell>{subscription?.name ?? ''}</TableCell>
                  <TableCell>{`${subscription?.amount ?? ''} ${subscription?.currency ?? ''}`}</TableCell>
                  <TableCell className="hidden sm:table-cell">{subscription?.frequency ?? ''}</TableCell>
                  <TableCell className="hidden sm:table-cell">{subscription?.nextPaymentDate ?? ''}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(subscription)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(subscription.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold">Total Monthly Cost: {totalAmount.toFixed(2)} {filteredData[0]?.currency}</p>
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

      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {/* Edit subscription form here */}
        </DialogContent>
      </Dialog>
    </Card>
  )
}