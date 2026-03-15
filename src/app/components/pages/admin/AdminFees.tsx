import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { getFeesStats } from "../../../services/adminService";

type FeeStats = {
  totalRevenue: number;
  pendingPayments: number;
  paidStudents: number;
  growthRate: number;
};

export function AdminFees() {
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFees() {
      try {
        const data = await getFeesStats();
        setStats(data ?? null);
      } catch (err) {
        console.error("Fee stats fetch failed:", err);
        setError("Failed to load fee data");
      } finally {
        setLoading(false);
      }
    }

    loadFees();
  }, []);

  if (loading) return <div className="p-6">Loading fee dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!stats) return <div className="p-6">No data available</div>;

  const cards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Pending Payments",
      value: `$${stats.pendingPayments}`,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Paid Students",
      value: stats.paidStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Growth Rate",
      value: `${stats.growthRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Fee Management</h1>
        <p className="text-gray-600">Track all fee transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;

          return (
            <Card key={c.label}>
              <CardContent className="p-6">
                <div className={`${c.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${c.color}`} />
                </div>

                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-gray-600">{c.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}