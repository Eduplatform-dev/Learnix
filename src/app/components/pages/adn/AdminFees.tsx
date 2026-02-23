import { Card, CardContent } from '../../ui/card';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';

export function AdminFees() {
  const stats = [
    { label: 'Total Revenue', value: '$124,590', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Pending Payments', value: '$8,450', icon: CreditCard, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { label: 'Paid Students', value: '2,145', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Growth Rate', value: '+8.2%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>
        <p className="text-gray-600 mt-1">Track and manage all fee transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee management dashboard coming soon</h3>
          <p className="text-gray-600">Monitor transactions, refunds, and payment analytics</p>
        </CardContent>
      </Card>
    </div>
  );
}
