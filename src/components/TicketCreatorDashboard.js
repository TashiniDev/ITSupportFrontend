import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';

export default function TicketCreatorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) return;
    try {
      setUser(JSON.parse(raw));
    } catch (e) {
      console.warn('invalid userData', e);
    }
  }, []);

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Support Tickets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">View and manage all your submitted tickets</p>
          </div>
          <div>
            <Button onClick={() => navigate('/tickets/create')} className="bg-blue-600 text-white">+ Create New Ticket</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</div>
            <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">0</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">New</div>
            <div className="mt-4 text-2xl font-bold text-blue-600">0</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
            <div className="mt-4 text-2xl font-bold text-amber-600">0</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Processing</div>
            <div className="mt-4 text-2xl font-bold text-orange-500">0</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            <div className="mt-4 text-2xl font-bold text-green-600">0</div>
          </div>
        </div>

  <div className="bg-white dark:bg-[rgb(12,16,20)] dark:border dark:border-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"></path></svg>
              <span>Filters</span>
            </div>
            <button className="text-sm text-gray-500 dark:text-gray-300">Clear All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Category</Label>
              <Select>
                <option>All Categories</option>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select>
                <option>All Team Members</option>
              </Select>
            </div>
            <div>
              <Label>Date From</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Date To</Label>
              <Input type="date" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
          <div className="font-medium text-gray-800 dark:text-gray-200 mb-4">All My Tickets (0)</div>
          <div className="h-60 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h6m0 0v6m0-6l-3 3"></path></svg>
            <div>No tickets found. Create your first ticket to get started!</div>
            <div className="mt-4">
              <Button onClick={() => navigate('/tickets/create')} className="bg-blue-600 text-white">+ Create New Ticket</Button>
            </div>
          </div>
        </div>
      </main>
  );
}
