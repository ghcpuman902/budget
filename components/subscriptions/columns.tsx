"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PartialSubscription } from './types';

export const columns: ColumnDef<PartialSubscription, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'nextPaymentDate',
    header: 'Next Payment Date',
    cell: info => info.getValue() ?? 'N/A',
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment Method',
    cell: info => info.getValue() ?? 'N/A',
  },
  // Add other columns as needed
];