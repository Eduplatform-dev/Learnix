import { TrendingUp, Users, DollarSign, BookOpen, Clock, Award, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function AdminAnalytics() {
  const monthlyGrowth = [
    { month: 'Jan', users: 1850, revenue: 45000, courses: 42 },
    { month: 'Feb', users: 1920, revenue: 48000, courses: 43 },
    { month: 'Mar', users: 2100, revenue: 52000, courses: 44 },
    { month: 'Apr', users: 2250, revenue: 58000, courses: 46 },
    { month: 'May', users: 2380, revenue: 65000, courses: 47 },
    { month: 'Jun', users: 2543, revenue: 74000, courses: 48 },
  ];

  const userEngagement = [
    { day: 'Mon', active: 1850, sessions: 3200 },
    { day: 'Tue', active: 2100, sessions: 3600 },
    { day: 'Wed', active: 1950, sessions: 3400 },
    { day: 'Thu', active: 2300, sessions: 3900 },
    { day: 'Fri', active: 2150, sessions: 3700 },
    { day: 'Sat', active: 1600, sessions: 2800 },
    { day: 'Sun', active: 1400, sessions: 2400 },
  ];

  const courseRatings = [
    { subject: 'Content Quality', value: 92 },
    { subject: 'Instructor', value: 88 },
    { subject: 'Platform', value: 85 },
    { subject: 'Support', value: 90 },
    { subject: 'Value', value: 87 },
  ];

  const trafficSources = [
    { name: 'Direct', value: 35, color: '#6366f1' },
    { name: 'Search', value: 28, color: '#8b5cf6' },
    { name: 'Social', value: 22, color: '#ec4899' },
    { name: 'Referral', value: 15, color: '#f59e0b' },
  ];

  const completionRates = [
    { category: 'Web Development', rate: 87, students: 450 },
    { category: 'Data Science', rate: 82, students: 380 },
    { category: 'Mobile Dev', rate: 89, students: 320 },
    { category: 'UI/UX Design', rate: 85, students: 290 },
    { category: 'Cloud Computing', rate: 88, students: 220 },
  ];

  const kpiMetrics = [
    {
      label: 'Avg. Completion Rate',
      value: '84.3%',
      change: '+2.1%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Student Satisfaction',
      value: '4.7/5',
      change: '+0.3',
      trend: 'up',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Avg. Session Time',
      value: '48 min',
      change: '+5 min',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Daily Active Users',
      value: '2,145',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Detailed insights and performance metrics</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${metric.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <span className={`text-sm ${metric.color} flex items-center gap-1`}>
                    <TrendingUp className="w-4 h-4" />
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth Trends (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Engagement & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Daily User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#6366f1" name="Active Users" />
                <Bar dataKey="sessions" fill="#ec4899" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Ratings & Completion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Course Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Course Quality Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={courseRatings}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Rating Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Rates by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rates by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completionRates.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-600">{item.rate}% ({item.students} students)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
