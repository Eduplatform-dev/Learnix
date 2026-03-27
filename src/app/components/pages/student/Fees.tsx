﻿import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  CreditCard, DollarSign, Download, Calendar, CheckCircle, AlertCircle, Clock,
} from "lucide-react";
import { getMyFees, markFeePaid, type Fee, type MyFeesResponse } from "../../../services/feeService";

const statusColor = (s: string) => {
  switch (s) {
    case "paid": return "bg-green-100 text-green-700";
    case "pending": return "bg-amber-100 text-amber-700";
    case "overdue": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const statusIcon = (s: string) => {
  if (s === "paid") return <CheckCircle className="w-4 h-4" />;
  if (s === "overdue") return <AlertCircle className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
};

export function Fees() {
  const [data, setData] = useState<MyFeesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyFees()
      .then(setData)
      .catch(() => setError("Failed to load fee data."))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (fee: Fee) => {
    if (payingId) return;
    setPayingId(fee._id);
    try {
      const updated = await markFeePaid(fee._id);
      setData((prev) => {
        if (!prev) return prev;
        const fees = prev.fees.map((f) => (f._id === updated._id ? updated : f));
        const totalPaid = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
        const totalPending = fees.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
        const nextFee = fees.find((f) => f.status === "pending") ?? null;
        return { fees, totalPaid, totalPending, nextFee };
      });
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading fee information...</div>;

  if (error && !data) return (
    <div className="p-6">
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">No fee records found. Contact your administrator.</p>
        </CardContent>
      </Card>
    </div>
  );

  const fees = data?.fees ?? [];
  const upcoming = fees.filter((f) => f.status === "pending");
  const history = fees.filter((f) => f.status === "paid");

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ${(data?.totalPending ?? 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">{upcoming.length} pending payment{upcoming.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Paid</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ${(data?.totalPaid ?? 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">{history.length} payment{history.length !== 1 ? "s" : ""} completed</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Next Payment Due</p>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            {data?.nextFee ? (
              <>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  ${data.nextFee.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Due: {new Date(data.nextFee.dueDate).toLocaleDateString()}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-green-600 mb-1">All clear!</p>
                <p className="text-sm text-gray-500">No upcoming payments</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      {upcoming.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {upcoming.map((fee) => (
              <div
                key={fee._id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  fee.status === "overdue"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900 mb-1">{fee.description}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                    {fee.semester && <span className="text-gray-400">· {fee.semester}</span>}
                    <Badge className={`text-xs ${statusColor(fee.status)}`}>
                      {fee.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-xl font-bold text-gray-900">${fee.amount.toFixed(2)}</p>
                  <Button
                    size="sm"
                    onClick={() => handlePay(fee)}
                    disabled={payingId === fee._id}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {payingId === fee._id ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fee Breakdown */}
      {fees.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Fee Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {fees.map((fee, i) => (
                <div key={fee._id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{fee.description}</p>
                      <p className="text-sm text-gray-500 capitalize">{fee.category}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${fee.amount.toFixed(2)}</p>
                  </div>
                  {i < fees.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <p className="font-semibold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${fees.reduce((s, f) => s + f.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods - static UI */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>Saved Payment Methods</CardTitle>
            <Button variant="outline" size="sm">Add New</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Visa", last4: "4242" },
              { name: "Mastercard", last4: "8888" },
            ].map((method) => (
              <div
                key={method.last4}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-500 cursor-pointer transition-colors"
              >
                <CreditCard className="w-7 h-7 text-indigo-600 mb-3" />
                <p className="font-medium text-gray-900 mb-1">{method.name}</p>
                <p className="text-sm text-gray-500">**** {method.last4}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {history.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Description", "Date Paid", "Amount", "Status", "Invoice", ""].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {history.map((fee) => (
                    <tr key={fee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{fee.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${fee.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusColor(fee.status)}`}>
                          {statusIcon(fee.status)}
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{fee.invoice || "—"}</td>
                      <td className="px-6 py-4 text-right">
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
      )}

      {fees.length === 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No fee records found.</p>
            <p className="text-sm text-gray-400 mt-1">Contact your administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
