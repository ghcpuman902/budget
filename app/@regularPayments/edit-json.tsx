'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditJson() {
  const [jsonData, setJsonData] = useState<string>('')

  useEffect(() => {
    const savedData = localStorage.getItem('recurringPaymentsData')
    if (savedData) {
      setJsonData(savedData)
    }
  }, [])

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(jsonData)
      localStorage.setItem('recurringPaymentsData', JSON.stringify(parsedData, null, 2))
      alert('Data saved successfully!')
    } catch (error) {
      alert('Invalid JSON data')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Recurring Payments JSON Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="min-h-[300px] w-full"
        />
        <Button onClick={handleSave} className="w-full sm:w-auto">
          Save JSON Data
        </Button>
      </CardContent>
    </Card>
  )
}