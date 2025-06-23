'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";

type EventUpdate = {
  eventId: string;
  eventTitle: string;
  updates: {
    changes: string[];
    updatedBy: string;
    at: string;
  }[];
};

export default function CheckUpdatesButton() {
  const [updates, setUpdates] = useState<EventUpdate[] | string[]>([]);

  const handleCheckUpdates = async () => {
    try {
      const res = await api.get("/subscriptions/check-logs");
      setUpdates(res.data);
    } catch (error) {
      console.error("Failed to fetch updates", error);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <Button onClick={handleCheckUpdates}>Check Updates</Button>

      {Array.isArray(updates) && updates.length > 0 && typeof updates[0] === "string" ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">{updates[0]}</div>
      ) : (
        updates.map((event, idx) => (
          <div
            key={(event as EventUpdate).eventId}
            className={`border rounded-lg p-4 space-y-2 ${
              idx < 3 ? "bg-green-100 border-green-400" : "bg-gray-100 border-gray-300"
            }`}
          >
            <div className="font-bold text-lg">{(event as EventUpdate).eventTitle}</div>
            {(event as EventUpdate).updates.map((update, i) => (
              <div key={i} className="space-y-1 ml-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Updated By:</span> {update.updatedBy}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Time:</span>{" "}
                  {format(new Date(update.at), "PPPppp")}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-800">
                  {update.changes.map((change, j) => (
                    <li key={j}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
