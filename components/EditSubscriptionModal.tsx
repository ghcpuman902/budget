'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Subscription } from '@/components/subscriptions/types'
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditSubscriptionModalProps {
  subscription: Subscription | null
  onSave: (updatedSubscription: Subscription) => void
  onClose: () => void
}

export function EditSubscriptionModal({ subscription, onSave, onClose }: EditSubscriptionModalProps) {
  const [editedSubscription, setEditedSubscription] = useState<Subscription | null>(subscription)

  useEffect(() => {
    if (subscription) {
      setEditedSubscription(subscription)
    }
  }, [subscription])

  if (!editedSubscription) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedSubscription(prev => ({ ...prev!, [name]: value }))
  }

  function formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject instanceof Date && !isNaN(dateObject.getTime())
      ? dateObject.toISOString().split('T')[0]
      : '';
  }
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setEditedSubscription(prev => ({ ...prev!, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditedSubscription(prev => ({ ...prev!, [name]: value }))
  }

  const handlePaymentMethodChange = (name: string, value: string) => {
    setEditedSubscription(prev => ({
      ...prev!,
      paymentMethodDetails: {
        ...prev!.paymentMethodDetails,
        [name.split('.')[1]]: value
      }
    }))
  }

  const handlePastPaymentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const pastPayments = JSON.parse(e.target.value)
      setEditedSubscription(prev => ({ ...prev!, pastPayments }))
    } catch (error) {
      console.error("Invalid JSON for past payments")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editedSubscription!)
  }

  return (
    <Dialog open={!!subscription} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" name="name" value={editedSubscription.name} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" value={editedSubscription.amount} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" value={editedSubscription.currency} readOnly />
            </div>
            <div>
              <Label htmlFor="frequency">Billing Cycle</Label>
              <Select name="frequency" value={editedSubscription.frequency} onValueChange={(value) => handleSelectChange('frequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
              <Input id="nextPaymentDate" name="nextPaymentDate" type="date" value={formatDate(editedSubscription.nextPaymentDate)} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="firstPaymentDate">First Payment Date</Label>
              <Input id="firstPaymentDate" name="firstPaymentDate" type="date" value={formatDate(editedSubscription.firstPaymentDate)} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="expectedEndDate">Expected End Date</Label>
              <Input id="expectedEndDate" name="expectedEndDate" type="date" value={formatDate(editedSubscription.expectedEndDate)} onChange={handleInputChange} />
            </div>
          </div>
          
          <div>
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Select name="paymentMethodDetails.type" value={editedSubscription.paymentMethodDetails?.type || ''} onValueChange={(value) => handlePaymentMethodChange('paymentMethodDetails.type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_debit">Direct Debit</SelectItem>
                  <SelectItem value="googlepay">Google Pay</SelectItem>
                  <SelectItem value="applepay">Apple Pay</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="klarna">Klarna</SelectItem>
                  <SelectItem value="afterpay">Afterpay</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="bank_account_paypal">Bank Account (PayPal)</SelectItem>
                  <SelectItem value="card_paypal">Card (PayPal)</SelectItem>
                  <SelectItem value="card_links">Card (Links)</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input name="paymentMethodDetails.details" placeholder="Details" value={editedSubscription.paymentMethodDetails?.details || ''} onChange={(e) => handlePaymentMethodChange('paymentMethodDetails.details', e.target.value)} />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pastPayments">Past Payments</Label>
            <Textarea id="pastPayments" name="pastPayments" value={JSON.stringify(editedSubscription.pastPayments || [], null, 2)} onChange={handlePastPaymentsChange} rows={4} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={editedSubscription.isActive} onCheckedChange={(checked) => handleSwitchChange('isActive', checked)} />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="isCancelled" checked={editedSubscription.isCancelled} onCheckedChange={(checked) => handleSwitchChange('isCancelled', checked)} />
            <Label htmlFor="isCancelled">Cancelled</Label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}