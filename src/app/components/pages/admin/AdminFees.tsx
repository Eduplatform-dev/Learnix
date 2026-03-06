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

  useEffect(() => {
    async function load() {
      try {
        const data = await getFeesStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load fee stats", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-6">Loading fee dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-6 text-red-600">Failed to load data</div>;
  }

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
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Fee Management
        </h1>
        <p className="text-gray-600 mt-1">
          Track and manage all fee transactions
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div
                  className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>

                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      <Card>
        <CardContent className="p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Fee management dashboard
          </h3>
          <p className="text-gray-600">
            Live payment analytics powered by database
          </p>
        </CardContent>
      </Card>
    </div>
  );
}