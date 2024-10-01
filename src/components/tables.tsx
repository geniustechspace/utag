"use client";

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableColumn,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";
import { useAuth } from "@/providers/auth-provider";
import {
  Feedback,
  Meeting,
  Promotion,
  useFeedbackModel,
  useMeetingModel,
  usePromotionModel,
  useUserModel,
} from "@/providers/models";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import { ComponentLoading } from "./loading";
import { FiMoreVertical } from "react-icons/fi";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { internalUrls } from "@/config/site-config";
import { getFormattedDate } from "@/utils";

interface TableProps<T> {
  maxRow?: number;
  label?: string;
  fields?: string[];
  filter?: (data: T[]) => T[];
}

export const QnATable = ({
  maxRow,
  label,
  fields,
  filter,
}: TableProps<Feedback>) => {
  const { user } = useAuth();
  const { getUser } = useUserModel();
  const { getAllFeedbacks, filterFeedbacks } = useFeedbackModel();

  const [feedbacks, setFeedbacks] = useState<Feedback[] | undefined>(undefined);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        let data: Feedback[];
        if (
          ["president", "secretary", "vice president"].includes(
            user.role.toLowerCase(),
          )
        ) {
          data = await getAllFeedbacks(maxRow);
        } else {
          data = await filterFeedbacks({ user_id: user.user_id });
        }

        // Fetch user names for each feedback
        const userIds = Array.from(new Set(data.map((p) => p.user_id)));
        const userPromises = userIds.map((user_id) => getUser(user_id));
        const users = await Promise.all(userPromises);

        const userMap: Record<string, string> = {};
        users.forEach((user) => {
          if (user) {
            userMap[user.user_id] = user.name;
          }
        });

        setUserNames(userMap);
        maxRow ? setFeedbacks(data.slice(0, maxRow)) : setFeedbacks(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load feedbacks");
      }
    };

    fetchData();
  }, [maxRow, user]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!feedbacks) {
    return <ComponentLoading message="Loading questions and discussions ..." />;
  }

  const columns = [
    { key: "submitted_date", label: "Submitted Date" },
    { key: "user_id", label: "User" },
    { key: "type", label: "Category" },
    { key: "subject", label: "Subject / Topic" },
    { key: "target_group", label: "Target Group" },
    { key: "read_status", label: "Read Count" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <Table
        color="primary"
        radius="sm"
        selectionMode="none"
        aria-label="Questions and discussions table"
        // topContent={TopContent}
        classNames={{
          wrapper:
            "card h-full rounded-md border-emerald-200 bg-transparent shadow-inner drop-shadow-md dark:border-default",
        }}
      >
        <TableHeader
          columns={
            fields ? columns.filter((col) => fields.includes(col.key)) : columns
          }
        >
          {(column) =>
            column.key === "actions" ? (
              <TableColumn key={column.key} className="text-end">
                {column.label}
              </TableColumn>
            ) : (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )
          }
        </TableHeader>
        <TableBody items={feedbacks} emptyContent={"No rows to display."}>
          {(feedback) => (
            <TableRow key={feedback._id}>
              {(columnKey) =>
                columnKey === "submitted_date" ? (
                  <TableCell>
                    {getFormattedDate(feedback.submitted_date)}
                  </TableCell>
                ) : columnKey === "user_id" ? (
                  <TableCell>
                    {userNames[feedback.user_id] || "Loading..."}
                  </TableCell>
                ) : columnKey === "actions" ? (
                  <TableCell className="text-end">
                    <Dropdown
                      showArrow
                      radius="sm"
                      placement="bottom-end"
                      offset={12}
                      shadow="md"
                      closeOnSelect={true}
                    >
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() => null}
                        >
                          <FiMoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>

                      <DropdownMenu
                        color="primary"
                        variant="faded"
                        aria-label="Notifications"
                      >
                        <DropdownItem
                          key="feedback_details"
                          href={`${internalUrls.qna}/${feedback._id}`}
                          classNames={{ title: "font-semibold" }}
                        >
                          View details
                        </DropdownItem>
                        <DropdownItem
                          key="approve_feedback"
                          classNames={{ title: "font-semibold" }}
                          onClick={() => null}
                        >
                          Download everything
                        </DropdownItem>
                        <DropdownItem
                          key="download_documents"
                          classNames={{ title: "font-semibold" }}
                        >
                          Download documents only
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                ) : (
                  <TableCell>{getKeyValue(feedback, columnKey)}</TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export const PromotionsTable = ({
  maxRow,
  label,
  fields,
  filter,
}: TableProps<Promotion>) => {
  const { user } = useAuth();
  const { getUser } = useUserModel();
  const { getAllPromotions, filterPromotions } = usePromotionModel();

  const [promotions, setPromotions] = useState<Promotion[] | undefined>(
    undefined,
  );
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        let data: Promotion[];
        if (
          ["president", "secretary", "vice president"].includes(
            user.role.toLowerCase(),
          )
        ) {
          data = await getAllPromotions(maxRow);
        } else {
          data = await filterPromotions({ user_id: user.user_id });
        }

        // Fetch user names for each promotion
        const userIds = Array.from(new Set(data.map((p) => p.user_id)));
        const userPromises = userIds.map((user_id) => getUser(user_id));
        const users = await Promise.all(userPromises);

        const userMap: Record<string, string> = {};
        users.forEach((user) => {
          if (user) {
            userMap[user.user_id] = user.name;
          }
        });

        setUserNames(userMap);
        maxRow ? setPromotions(data.slice(0, maxRow)) : setPromotions(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load promotions");
      }
    };

    fetchData();
  }, [maxRow, user]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!promotions) {
    return <ComponentLoading message="Loading promotions ..." />;
  }

  const columns = [
    { key: "application_date", label: "Application Date" },
    { key: "user_id", label: "User" },
    { key: "current_rank", label: "Current Rank" },
    { key: "desired_rank", label: "Desired Rank" },
    { key: "attachment_count", label: "Attachments" },
    { key: "status", label: "Status" },
    { key: "assessment_score", label: "Assessment Score" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <Table
        color="primary"
        radius="sm"
        selectionMode="none"
        aria-label="Promotions table"
        // topContent={TopContent}
        classNames={{
          wrapper:
            "card h-full rounded-md border-emerald-200 bg-transparent shadow-inner drop-shadow-md dark:border-default",
        }}
      >
        <TableHeader
          columns={
            fields ? columns.filter((col) => fields.includes(col.key)) : columns
          }
        >
          {(column) =>
            column.key === "actions" ? (
              <TableColumn key={column.key} className="text-end">
                {column.label}
              </TableColumn>
            ) : (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )
          }
        </TableHeader>
        <TableBody items={promotions} emptyContent={"No rows to display."}>
          {(promotion) => (
            <TableRow key={promotion.promotion_id}>
              {(columnKey) =>
                columnKey === "application_date" ? (
                  <TableCell>
                    {getFormattedDate(promotion.application_date)}
                  </TableCell>
                ) : columnKey === "user_id" ? (
                  <TableCell>
                    {userNames[promotion.user_id] || ""}
                  </TableCell>
                ) : columnKey === "attachment_count" ? (
                  <TableCell>
                    {promotion.attachments?.length || ""}
                  </TableCell>
                ) : columnKey === "actions" ? (
                  <TableCell className="text-end">
                    <Dropdown
                      showArrow
                      radius="sm"
                      placement="bottom-end"
                      offset={12}
                      shadow="md"
                      closeOnSelect={true}
                    >
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() => null}
                        >
                          <FiMoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>

                      <DropdownMenu
                        color="primary"
                        variant="faded"
                        aria-label="Notifications"
                      >
                        <DropdownItem
                          key="promotion_details"
                          href={`${internalUrls.promotions}/${promotion.promotion_id}`}
                          classNames={{ title: "font-semibold" }}
                        >
                          View details
                        </DropdownItem>
                        <DropdownItem
                          key="approve_promotion"
                          classNames={{ title: "font-semibold" }}
                          onClick={() => null}
                        >
                          Download everything
                        </DropdownItem>
                        <DropdownItem
                          key="download_documents"
                          classNames={{ title: "font-semibold" }}
                        >
                          Download documents only
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                ) : (
                  <TableCell>{getKeyValue(promotion, columnKey)}</TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export const MeetingsTable = ({
  maxRow,
  label,
  fields,
  filter,
}: TableProps<Meeting>) => {
  const { user } = useAuth();
  const { getAllMeetings } = useMeetingModel();

  const [meetings, setMeetings] = useState<Meeting[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data = await getAllMeetings(maxRow);
        maxRow ? setMeetings(data.slice(0, maxRow)) : setMeetings(data);
      } catch (e) {
        setError("Failed to load meetings");
      }
    };

    fetchData();
  }, [maxRow, getAllMeetings]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!meetings) {
    return <ComponentLoading message="Loading meetings ..." />;
  }

  const columns = [
    { key: "title", label: "Title" },
    { key: "location", label: "Address" },
    { key: "guestAndSpeakers", label: "Guests/Speakers" },
    { key: "date", label: "Meeting Date" },
    { key: "time", label: "Meeting Time" },
    // { key: "attendees", label: "Attendees" },
    // { key: "time", label: "Meeting Time" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <Table
        color="primary"
        radius="sm"
        selectionMode="none"
        aria-label="Meetings table"
        // topContent={TopContent}
        classNames={{
          wrapper:
            "card h-full rounded-md border-emerald-200 bg-transparent shadow-inner drop-shadow-md dark:border-default",
        }}
      >
        <TableHeader
          columns={
            fields ? columns.filter((col) => fields.includes(col.key)) : columns
          }
        >
          {(column) =>
            column.key === "actions" ? (
              <TableColumn key={column.key} className="text-end">
                {column.label}
              </TableColumn>
            ) : (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )
          }
        </TableHeader>
        <TableBody items={meetings} emptyContent={"No rows to display."}>
          {(meeting) => (
            <TableRow key={meeting.meeting_id}>
              {(columnKey) =>
                columnKey === "date" ? (
                  <TableCell>{getFormattedDate(meeting.date)}</TableCell>
                ) : columnKey === "guestAndSpeakers" ? (
                  <TableCell>
                    {meeting.guestAndSpeakers?.join(", ") || ""}
                  </TableCell>
                ) : columnKey === "attendees" ? (
                  <TableCell>{meeting.attendees?.length || ""}</TableCell>
                ) : columnKey === "actions" ? (
                  <TableCell className="text-end">
                    <Dropdown
                      showArrow
                      radius="sm"
                      placement="bottom-end"
                      offset={12}
                      shadow="md"
                      closeOnSelect={true}
                    >
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() => null}
                        >
                          <FiMoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>

                      <DropdownMenu
                        color="primary"
                        variant="faded"
                        aria-label="Notifications"
                      >
                        <DropdownItem
                          key="approve_meeting"
                          classNames={{ title: "font-semibold" }}
                          onClick={() => null}
                        >
                          Register
                        </DropdownItem>
                        <DropdownItem
                          key="meeting_details"
                          href={`${internalUrls.meetings}/${meeting.meeting_id}`}
                          classNames={{ title: "font-semibold" }}
                        >
                          View details
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                ) : (
                  <TableCell>{getKeyValue(meeting, columnKey)}</TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
