import { useEffect, useState } from "react";
import { useMeetingModel } from "@/providers/models";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Meeting } from "@/providers/models";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";

export const MeetingSummaryCard: React.FC = () => {
  const { getAllMeetings } = useMeetingModel();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const meetings = await getAllMeetings();

        // Sort meetings by the date timestamp directly
        const sortedMeetings = meetings
          .filter((meeting) => meeting.date.toDate() >= new Date()) // Future meetings only
          .sort((a, b) => a.date.toDate() - b.date.toDate()) // Sort by the timestamp
          .slice(0, 2); // Get the next 3 upcoming meetings

        setUpcomingMeetings(sortedMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, [getAllMeetings]);

  return (
    <>
      <Card radius="sm" className="w-full">
        <CardHeader className="border-b-1">
          <div className="font-bold">Upcoming Meetings</div>
        </CardHeader>
        <CardBody className="grid lg:grid-cols-11 gap-3">
          {upcomingMeetings.length === 0 && (
            <p className="text-center text-gray-600">No upcoming meetings.</p>
          )}
          {upcomingMeetings.map((meeting, idx) => (
            <>
              <div key={meeting.meeting_id} className="col-span-5">
                <h3 className="font-semibold text-lg">{meeting.title}</h3>
                {meeting.location && (
                  <p className="my-1">Address: {meeting.location}</p>
                )}
                <Chip radius="sm" variant="faded" color="primary">
                  {meeting.date.toDate().toDateString()} @{" "}
                  {meeting.date.toDate().toLocaleTimeString()}
                </Chip>
                {meeting.guestAndSpeakers && (
                  <p className="text-default-500 mt-1">
                    Guest/Speakers: {meeting.guestAndSpeakers.join(", ")}
                  </p>
                )}
              </div>

              {idx < upcomingMeetings.length - 1 && (
                <Divider
                  orientation="vertical"
                  className="col-span-1 place-self-center"
                />
              )}
            </>
          ))}
        </CardBody>
      </Card>
    </>
  );
};
