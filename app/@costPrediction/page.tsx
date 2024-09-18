"use client"

import { useState } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CostPredictionPage() {
  const [months, setMonths] = useState(1)
  const [totalCost, setTotalCost] = useState(0)

  const calculateCost = () => {
    // This is a simplified calculation. In a real app, you'd fetch actual payment data.
    const monthlyTotal = 14.99 + 49.99 + 79.99
    setTotalCost(monthlyTotal * months)
  }

  return (
    <TabsContent value="prediction">
      <Card>
        <CardHeader>
          <CardTitle>Cost Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="months">Number of Months</Label>
              <Input
                id="months"
                type="number"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                min={1}
              />
            </div>
            <Button onClick={calculateCost}>Calculate Total Cost</Button>
            {totalCost > 0 && (
              <div className="text-lg font-semibold">
                Predicted Total Cost: ${totalCost.toFixed(2)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}