"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Meeting, useMeetingModel } from "@/providers/models";

export default function MeetingDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const { meetingCache, getMeeting } = useMeetingModel(); // Fetch meeting functions from context
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Get the last segment of the URL path
  const meeting_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  console.log(meeting_id);

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
        <strong>Speakers:</strong>
        <ul className="list-disc pl-6">
          {meeting.participants?.map((participant) => (
            <li key={participant}>{participant}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
