"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Meeting, useMeetingModel } from "@/providers/models";

export default function MeetingDetailsPage() {
  const { meetingCache, getMeeting } = useMeetingModel(); // Fetch meeting functions from context
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { meeting_id } = router.query; // Assume meeting_id is passed via query params

  useEffect(() => {
    if (meeting_id) {
      // Fetch meeting details once meeting_id is available
      const fetchMeetingDetails = async () => {
        try {
          const meetingData = await getMeeting(meeting_id as string);
          setMeeting(meetingData);
        } catch (error) {
          console.error("Error fetching meeting details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMeetingDetails();
    }
  }, [meeting_id, meetingCache, getMeeting]);

  if (loading) return <div>Loading...</div>;
  if (!meeting) return <div>No meeting found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{meeting.title}</h1>
      <p className="mb-2">
        <strong>Agenda:</strong> {meeting.agenda}
      </p>
      <p className="mb-2">
        <strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}
      </p>
      <p className="mb-2">
        <strong>Time:</strong> {meeting.time}
      </p>
      <p className="mb-2">
        <strong>Location:</strong> {meeting.location}
      </p>
      {meeting.minutes && (
        <p className="mb-2">
          <strong>Minutes:</strong> {meeting.minutes}
        </p>
      )}
      <div className="mb-2">
        <strong>Participants:</strong>
        <ul className="list-disc pl-6">
          {meeting.participants?.map((participant) => (
            <li key={participant}>{participant}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
