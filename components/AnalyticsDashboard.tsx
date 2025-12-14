'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FormAnalytics {
  formId: string;
  formName: string;
  totalViews: number;
  totalResponses: number;
  conversionRate: number;
  averageTimeSpent: number;
  completionRate: number;
  abandonmentRate: number;
  topFields: Array<{
    fieldName: string;
    interactionCount: number;
  }>;
  responsesOverTime: Array<{
    date: string;
    responses: number;
    views: number;
  }>;
  responsesByCountry: Array<{
    country: string;
    count: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  analytics: FormAnalytics;
}

const COLORS = ['#36a64f', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
}) => {
  const [selectedMetric, setSelectedMetric] = useState('views');

  const StatCard = ({
    title,
    value,
    subtext,
  }: {
    title: string;
    value: string | number;
    subtext?: string;
  }) => (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full bg-gray-50 rounded-lg p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {analytics.formName} - Analytics
        </h1>
        <p className="text-gray-600 mt-2">Form ID: {analytics.formId}</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          subtext="Form page impressions"
        />
        <StatCard
          title="Total Responses"
          value={analytics.totalResponses.toLocaleString()}
          subtext={`${analytics.completionRate.toFixed(1)}% completion rate`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(2)}%`}
          subtext={`${(analytics.totalResponses / (analytics.totalViews || 1) * 100).toFixed(2)}% actual`}
        />
        <StatCard
          title="Avg Time Spent"
          value={`${analytics.averageTimeSpent.toFixed(1)}s`}
          subtext={`${analytics.abandonmentRate.toFixed(1)}% abandoned`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Responses Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Responses Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.responsesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="responses" stroke="#36a64f" />
                <Line type="monotone" dataKey="views" stroke="#4ECDC4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, percentage }) =>
                    `${device}: ${percentage}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {analytics.deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Fields */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Interacted Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topFields}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fieldName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="interactionCount" fill="#36a64f" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Responses by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Responses by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">Country</th>
                  <th className="text-right py-2 px-4 font-semibold">Responses</th>
                  <th className="text-right py-2 px-4 font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analytics.responsesByCountry.map((country, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{country.country}</td>
                    <td className="text-right py-2 px-4">{country.count}</td>
                    <td className="text-right py-2 px-4">
                      {(
                        (country.count / analytics.totalResponses) *
                        100
                      ).toFixed(1)}%
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
};

export default AnalyticsDashboard;
