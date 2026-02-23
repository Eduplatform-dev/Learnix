import { Users, BookOpen, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboard() {
  const stats = [
    {
      title: 'Total Students',
      value: '2,543',
      change: '+12.5%',
      icon: Users,
      color: 'from-indigo-600 to-blue-600',
      trend: 'up'
    },
    {
      title: 'Active Courses',
      value: '48',
      change: '+3 new',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-600',
      trend: 'up'
    },
    {
      title: 'Revenue (This Month)',
      value: '$124,590',
      change: '+8.2%',
      icon: DollarSign,
      color: 'from-violet-600 to-purple-600',
      trend: 'up'
    },
    {
      title: 'Completion Rate',
      value: '84.3%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'from-orange-600 to-amber-600',
      trend: 'up'
    }
  ];

  const enrollmentData = [
    { month: 'Jan', students: 420, revenue: 42000 },
    { month: 'Feb', students: 380, revenue: 38000 },
    { month: 'Mar', students: 510, revenue: 51000 },
    { month: 'Apr', students: 590, revenue: 59000 },
    { month: 'May', students: 680, revenue: 68000 },
    { month: 'Jun', students: 750, revenue: 75000 },
  ];

  const coursePerformance = [
    { course: 'Web Dev', enrolled: 450, completed: 385 },
    { course: 'Data Science', enrolled: 380, completed: 310 },
    { course: 'Mobile Dev', enrolled: 320, completed: 285 },
    { course: 'UI/UX', enrolled: 290, completed: 245 },
    { course: 'Cloud', enrolled: 220, completed: 195 },
  ];

  const categoryDistribution = [
    { name: 'Technology', value: 45, color: '#6366f1' },
    { name: 'Business', value: 25, color: '#8b5cf6' },
    { name: 'Design', value: 20, color: '#ec4899' },
    { name: 'Other', value: 10, color: '#f59e0b' },
  ];

  const recentActivities = [
    { action: 'New student enrolled', user: 'Sarah Johnson', time: '5 min ago', type: 'success' },
    { action: 'Course completed', user: 'Mike Chen', time: '12 min ago', type: 'info' },
    { action: 'Payment received', user: 'Emma Wilson', time: '25 min ago', type: 'success' },
    { action: 'Assignment submitted', user: 'James Brown', time: '1 hour ago', type: 'info' },
    { action: 'Support ticket created', user: 'Lisa Garcia', time: '2 hours ago', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/90 mt-1">Welcome back! Here's an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    <p className="text-sm text-emerald-600 mt-1 font-medium">{stat.change}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Enrollment & Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} name="Students" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Course Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="course" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend />
                <Bar dataKey="enrolled" fill="#6366f1" name="Enrolled" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Course Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 p-3 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-emerald-500' :
                    activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-sm text-slate-600">{activity.user}</p>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}