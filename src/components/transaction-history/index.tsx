import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockTransactions = [
  {
    id: 1,
    wethAmount: 0.5,
    erc20Amount: 100,
    recipient: "0xabcd...efgh",
    status: "Success",
    timestamp: "2023-05-01 14:30:00",
  },
  {
    id: 2,
    wethAmount: 0.3,
    erc20Amount: 60,
    recipient: "0x1234...5678",
    status: "Pending",
    timestamp: "2023-05-01 15:45:00",
  },
  {
    id: 3,
    wethAmount: 0.2,
    erc20Amount: 40,
    recipient: "0x9876...5432",
    status: "Failed",
    timestamp: "2023-05-01 16:15:00",
  },
];

export default function TransactionHistory() {
  return (
    <Table className="mt-10">
      <TableHeader>
        <TableRow>
          <TableHead>WETH Amount</TableHead>
          <TableHead>ERC20 Amount</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockTransactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{tx.wethAmount}</TableCell>
            <TableCell>{tx.erc20Amount}</TableCell>
            <TableCell>{tx.recipient}</TableCell>
            <TableCell>{tx.status}</TableCell>
            <TableCell>{tx.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
