import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import toastService from '../services/toastService';
import DashboardHeader from '../components/DashboardHeader';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    department: '',
    company: '',
    category: '',
    issueType: '',
    requestType: '',
    priority: 'Medium',
    description: '',
  });

  const [attachments, setAttachments] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((a) => [...a, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.department || !form.category) {
      toastService.error('Please fill required fields: Full Name, Department and Category');
      return;
    }

    // Mock submit — replace with API call
    const id = toastService.loading('Creating ticket...');
    setTimeout(() => {
      toastService.dismiss(id);
      toastService.success('Ticket created successfully');
      navigate('/dashboard');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <DashboardHeader onLogout={() => navigate('/login')} />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button onClick={() => navigate(-1)} variant="ghost">&larr; Back to Tickets</Button>
          <h1 className="text-3xl font-bold mt-4">Create New Support Ticket</h1>
          <p className="text-sm text-gray-600">Fill out all details for faster resolution</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="text-xl">Personal Information</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Your contact number (optional)" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <div className="text-xl">Company & Department</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Department *</Label>
                  <Select name="department" value={form.department} onChange={handleChange}>
                    <option value="">Select your department</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                    <option value="it">IT</option>
                  </Select>
                </div>
                <div>
                  <Label>Company</Label>
                  <Select name="company" value={form.company} onChange={handleChange}>
                    <option value="">Select company (optional)</option>
                    <option value="printcare">Printcare</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <div className="text-xl">Issue Classification</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    <option value="powerapp">Power Apps</option>
                    <option value="development">Development</option>
                    <option value="server">Server/Application</option>
                    <option value="network">Network</option>
                    <option value="hris">HRIS</option>
                    <option value="hardware">Hardware</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Issue Type</Label>
                    <Select name="issueType" value={form.issueType} onChange={handleChange}>
                      <option value="">Select category first</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Request Type</Label>
                    <Select name="requestType" value={form.requestType} onChange={handleChange}>
                      <option value="">Select category first</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Priority Level *</Label>
                  <Select name="priority" value={form.priority} onChange={handleChange}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <div className="text-xl">Issue Description</div>
            </CardHeader>
            <CardContent>
              <Label>Detailed Problem Description</Label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="w-full rounded-md border-gray-200 bg-gray-50 p-3" placeholder="Please provide (optional):\n- What exactly happened?\n- When did it start?\n- Steps you've already tried\n- Any error messages\n- Impact on your work" />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="text-xl">Screenshots & Attachments</div>
            </CardHeader>
            <CardContent>
              <div className="border-dashed border-2 border-gray-200 rounded-md p-6 text-center">
                <input type="file" multiple onChange={handleFile} />
                <div className="text-sm text-gray-500 mt-2">Click to upload files or drag and drop. Screenshots, PNG, JPG, PDF, DOC, TXT files up to 10MB</div>
                {attachments.length > 0 && (
                  <ul className="mt-3 text-left text-sm text-gray-700">
                    {attachments.map((f, i) => (
                      <li key={i}>{f.name} ({Math.round(f.size/1024)} KB)</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-3">
            <Button type="submit" className="bg-blue-600 text-white">Create Ticket</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
