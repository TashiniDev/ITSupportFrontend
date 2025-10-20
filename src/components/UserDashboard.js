import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const UserDashboard = ({ user, session }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total submitted tickets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tickets in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Successfully resolved</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Submit a new IT support ticket for assistance with technical issues.
          </p>
          <div className="mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create Ticket
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};