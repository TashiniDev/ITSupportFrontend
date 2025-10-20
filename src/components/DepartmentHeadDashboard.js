import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const DepartmentHeadDashboard = ({ user, session }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Department Head Dashboard</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          IT Department Overview
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All tickets in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Requiring attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Successfully completed</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Power Apps Team</span>
                <span className="font-medium">0 tickets</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Development Team</span>
                <span className="font-medium">0 tickets</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Server/Application Team</span>
                <span className="font-medium">0 tickets</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network Team</span>
                <span className="font-medium">0 tickets</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>HRIS Team</span>
                <span className="font-medium">0 tickets</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Hardware Team</span>
                <span className="font-medium">0 tickets</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              View All Tickets
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Generate Reports
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Manage Teams
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};