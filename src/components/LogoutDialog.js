import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const LogoutDialog = ({ open, onOpenChange, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Confirm Logout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};