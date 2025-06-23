'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Event = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  date?: string;
  createdBy?: {
    _id: string;
    username: string;
  };
};

type SubscriptionStatus = {
  [eventId: string]: boolean;
};

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({});
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fetchEvents = async (query = '') => {
    try {
      const res = await api.get('/events', { params: { title: query } });
      const eventsData = res.data || [];
      setAllEvents(eventsData);
      setEvents(eventsData);

      if (!userId) {
        const userRes = await api.get('/auth/me');
        setUserId(userRes.data._id);
        fetchSubscriptionStatus(eventsData, userRes.data._id);
      } else {
        fetchSubscriptionStatus(eventsData, userId);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setAllEvents([]);
      setEvents([]);
    }
  };

  const fetchSubscriptionStatus = async (events: Event[]) => {
    try {
      const eventIds = events.map(event => event._id);
      const res = await api.post('/subscriptions/status', {
        eventIds
      });

      const statusMap: SubscriptionStatus = {};
      res.data.forEach((sub: { eventId: string; isSubscribed: boolean }) => {
        statusMap[sub.eventId] = sub.isSubscribed;
      });

      setSubscriptionStatus(statusMap);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setEvents(allEvents);
    } else if (filter === 'my' && userId) {
      const myEvents = allEvents.filter(event => event.createdBy?._id === userId);
      setEvents(myEvents);
    }
  }, [filter, allEvents, userId]);

  const handleSubscribe = async (eventId: string, isSubscribed: boolean) => {
    try {
      const method = isSubscribed ? 'delete' : 'post';
      await api[method](`/subscriptions/${eventId}`);

      setSubscriptionStatus(prev => ({
        ...prev,
        [eventId]: !isSubscribed
      }));

      setAllEvents(prev => prev.map(event =>
        event._id === eventId ? { ...event } : event
      ));
      setEvents(prev => prev.map(event =>
        event._id === eventId ? { ...event } : event
      ));
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/events/${id}`);
      setAllEvents(prev => prev.filter(event => event._id !== id));
      setEvents(prev => prev.filter(event => event._id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <>

    <div className="space-y-4">
      <Input
        placeholder="Search events by title..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchEvents(e.target.value);
        }}
      />

      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-black text-white' : ''}
          onClick={() => setFilter('all')}
        >
          All Events
        </Button>
        <Button
          variant={filter === 'my' ? 'default' : 'outline'}
          className={filter === 'my' ? 'bg-black text-white' : ''}
          onClick={() => setFilter('my')}
        >
          My Events
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event._id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                {event.createdBy && (
                  <p className="text-sm text-gray-500">
                    Created by: {event.createdBy.username}
                    {event.date && ` on ${format(new Date(event.date), "MMMM do, yyyy")}`}
                  </p>
                )}

              </CardHeader>
              <CardContent>

                <p>{event.description}</p>
                {event.image && (
                  <img
                    src={`${event.image}`}
                    alt="Event Banner"
                    className="mt-2 rounded-md"
                  />
                )}
                 <div className='flex justify-between'>

                <Button
                    className="mt-4"
                    variant={subscriptionStatus[event._id] ? "destructive" : "default"}
                    onClick={() => handleSubscribe(
                        event._id,
                        subscriptionStatus[event._id] || false
                    )}
                    >
                    {subscriptionStatus[event._id] ? "Unsubscribe" : "Subscribe"}
                    </Button>
                    {filter === 'my' && (
                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditEvent(event);
                          setEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(event._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                 </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500">
              {filter === 'my' ? 'No events created by you' : 'No events found'}
            </p>
          </div>
        )}
      </div>
    </div>

    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Event</DialogTitle>
      </DialogHeader>
      {editEvent && (
        <>
          <Input
            value={editEvent.title}
            onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
            placeholder="Title"
          />
          <Textarea
            value={editEvent.description}
            onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
            placeholder="Description"
          />
          <Input
            type="date"
            value={editEvent.date?.split("T")[0] || ""}
            onChange={(e) =>
              setEditEvent({ ...editEvent, date: new Date(e.target.value).toISOString() })
            }
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await api.put(`/events/${editEvent._id}`, {
                    title: editEvent.title,
                    description: editEvent.description,
                    date: editEvent.date,
                  });
                  fetchEvents(); 
                  setEditDialogOpen(false);
                } catch (error) {
                  console.error("Error updating event:", error);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
    </Dialog>
    </>
  );
}