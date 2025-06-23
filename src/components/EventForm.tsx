'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Popover } from './ui/popover';
import { PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

interface EventFormProps {
  onSuccess?: () => void;
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: null as File | null,
    date: undefined as Date | undefined,
  });

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.image || !form.date) {
      alert('All fields are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      if (form.image) data.append('image', form.image);
      if (form.date) data.append('date', form.date.toISOString());

      const response = await api.post('/events', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setForm({ title: '', description: '', image: null, date: undefined });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };


  return (
    <div className="space-y-4 border p-4 rounded-xl shadow-sm">
    <h2 className="text-xl font-semibold">Create New Event</h2>
    <Input
      name="title"
      placeholder="Event Title"
      value={form.title}
      onChange={handleChange}
    />
    <Textarea
      name="description"
      placeholder="Event Description"
      value={form.description}
      onChange={handleChange}
    />
    <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !form.date && 'text-muted-foreground'
            )}
          >
            {form.date ? format(form.date, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={form.date}
            onSelect={(date) => setForm((prev) => ({ ...prev, date }))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    <Input type="file" name="image" onChange={handleChange}  ref={fileInputRef} />
    <Button
  onClick={handleSubmit}
  disabled={!form.title || !form.description || !form.image || !form.date}
>
  Create Event
</Button>
  </div>
  );
}