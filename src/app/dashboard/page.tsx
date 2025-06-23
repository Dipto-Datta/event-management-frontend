'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/EventForm';
import EventList from '@/components/EventList';
import CheckUpdatesButton from '@/components/CheckUpdateButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface User {
  username: string;
  role: 'admin' | 'user';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const handleEventCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('auth/me');
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Info</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </>
          ) : (
            <p>Loading user info...</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <EventForm onSuccess={handleEventCreated} />
          <CheckUpdatesButton />
        </div>
        <EventList key={refreshKey} />
      </div>
    </div>
  );
}
