// src/components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthForm({ type }: { type: 'login' | 'register' }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, formData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">{type === 'login' ? 'Login' : 'Register'}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <Input name="username" type="name" placeholder="username" onChange={handleChange} />
      <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <Button onClick={handleSubmit} className="w-full">
        {type === 'login' ? 'Login' : 'Register'}
      </Button>
      <div className="text-center text-sm">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}