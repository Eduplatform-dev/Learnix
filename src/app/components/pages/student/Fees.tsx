﻿import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  CheckCircle,
  Wallet,
  Smartphone,
} from "lucide-react";

export function Fees() {
  const paymentMethods = [
    { id: "visa", name: "Visa", last4: "4242", icon: CreditCard },
    { id: "mastercard", name: "Mastercard", last4: "8888", icon: CreditCard },
    { id: "paypal", name: "PayPal", email: "john@example.com", icon: Wallet },
    { id: "gpay", name: "Google Pay", icon: Smartphone },
  ];

  const transactionHistory = [
    {
      id: 1,
      description: "Tuition Fee - Fall 2025",
      amount: 2850.0,
      date: "Nov 15, 2025",
      status: "Paid",
      invoice: "INV-2025-001",
    },
    {
      id: 2,
      description: "Course Materials",
      amount: 150.0,
      date: "Nov 20, 2025",
      status: "Paid",
      invoice: "INV-2025-002",
    },
    {
      id: 3,
      description: "Lab Fee",
      amount: 200.0,
      date: "Dec 1, 2025",
      status: "Paid",
      invoice: "INV-2025-003",
    },
    {
      id: 4,
      description: "Certification Exam",
      amount: 99.0,
      date: "Dec 10, 2025",
      status: "Pending",
      invoice: "INV-2025-004",
    },
  ];

  const upcomingPayments = [
    {
      id: 1,
      title: "Tuition Fee - Winter 2026",
      amount: 2850.0,
      dueDate: "Jan 15, 2026",
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Technology Fee",
      amount: 125.0,
      dueDate: "Jan 20, 2026",
      status: "Upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Current Balance</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$0.00</p>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              All paid
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Paid</p>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$3,299.00</p>
            <p className="text-sm text-gray-600">This academic year</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Next Payment</p>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$2,850</p>
            <p className="text-sm text-gray-600">Due: Jan 15, 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Tuition and Fees Breakdown */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Tuition and Fees</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Tuition Fee</p>
                <p className="text-sm text-gray-500">Fall 2025 Semester</p>
              </div>
              <p className="font-semibold text-gray-900">$2,500</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Technology Fee</p>
                <p className="text-sm text-gray-500">Per semester</p>
              </div>
              <p className="font-semibold text-gray-900">$250</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Lab Fee</p>
                <p className="text-sm text-gray-500">Science courses</p>
              </div>
              <p className="font-semibold text-gray-900">$100</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <p className="font-semibold text-gray-900">Total</p>
              <p className="text-2xl font-bold text-gray-900">$2,850</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>Secure Payment Methods</CardTitle>
            <Button variant="outline" size="sm">
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-7 h-7 text-indigo-600" />
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{method.name}</p>
                  <p className="text-sm text-gray-500">
                    {method.last4 ? `**** ${method.last4}` : method.email}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {upcomingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 mb-1">{payment.title}</p>
                  <p className="text-sm text-gray-600">Due: {payment.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 mb-2">${payment.amount.toFixed(2)}</p>
                  <Button size="sm">Pay Now</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transactionHistory.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          transaction.status === "Paid" ? "bg-green-500" : "bg-amber-500"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.invoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}