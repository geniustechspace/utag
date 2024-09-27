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
import { Promotion, usePromotionModel, useUserModel } from "@/providers/models";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import { getFormattedDate } from "@/utils";

interface TableProps<T> {
  maxRow?: number;
  label?: string;
  fields?: string[];
  filter?: (data: T[]) => T[];
}

export const PromotionsTable = ({
  maxRow,
  label,
  fields,
  filter,
}: TableProps<Promotion>) => {
  const { user } = useAuth();
  const { getUser } = useUserModel();
  const { promotionCache, getAllPromotions, filterPromotions } =
    usePromotionModel();

  const [promotions, setPromotions] = useState<Promotion[] | undefined>(
    undefined,
  );
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const TopContent = (
    <h3 className="font-bold">{label ? label : "Promotions"}</h3>
  );
  const BottomContent = <h3 className="font-bold">Recent in stock</h3>;

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
    return <div>Loading promotions...</div>;
  }

  const columns = [
    { key: "user_id", label: "User" },
    { key: "current_rank", label: "Current Rank" },
    { key: "desired_rank", label: "Desired Rank" },
    { key: "application_date", label: "Application Date" },
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
        aria-label="Stocks table"
        topContent={TopContent}
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
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={promotions} emptyContent={"No rows to display."}>
          {(promotion) => (
            <TableRow key={promotion.promotion_id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === "application_date" ? (
                    getFormattedDate(promotion.application_date)
                  ) : columnKey === "user_id" ? (
                    userNames[promotion.user_id] || "Loading..."
                  ) : columnKey === "actions" ? (
                    <Button size="sm" color="primary" onClick={() => null}>
                      Details
                    </Button>
                  ) : (
                    getKeyValue(promotion, columnKey)
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
