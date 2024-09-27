"use client"

import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";



export const SalesTable = ({
  maxRow,
  label,
  fields,
  filter,
}: TableProps<Sales>) => {
  const [transactions, setTransactions] = useState<Sales[] | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const TopContent = <h3 className="font-bold">{label ? label : "Sales"} </h3>;
  const BottomContent = <h3 className="font-bold">Recent in stock</h3>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await Sales.getAll();
        maxRow ? setTransactions(data.slice(0, maxRow)) : setTransactions(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load sales");
      }
    };
    fetchData();
  }, [maxRow]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!transactions) {
    return <div>Loading sales...</div>;
  }

  const columns = [
    { key: "date", label: "Date" },
    { key: "customer", label: "Customer" },
    { key: "products", label: "Products (name: qty)" },
    { key: "totalCost", label: "Total" },
    { key: "expenses", label: "Expenses" },
    { key: "payment", label: "Payment" },
    { key: "delivery", label: "Delivery" },
    { key: "processedBy", label: "Processed by" },
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
        // bottomContent={BottomContent}
        classNames={{
          wrapper:
            "card h-full rounded-md border-emerald-200 bg-transparent shadow-inner drop-shadow-md dark:border-default",
          table: "",
          tbody: "overflow-y-auto divide-y card rounded-md",
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
        <TableBody
          items={transactions}
          emptyContent={"No rows to display."}
          className=" "
        >
          {(sale) => (
            <TableRow key={sale.id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === "date" ? (
                    sale.date.toDateString()
                  ) : columnKey === "customer" ? (
                    sale.customer?.name
                  ) : columnKey === "products" ? (
                    <div className="flex flex-wrap gap-1">
                      {sale.products.map((product) => (
                        <Chip
                          key={product.id}
                          variant="flat"
                          size="sm"
                          radius="sm"
                        >
                          {product.name} : {product.qty} @ {product.price}
                        </Chip>
                      ))}
                    </div>
                  ) : columnKey === "totalCost" ? (
                    sale.getTotalPrice().toFixed(2)
                  ) : columnKey === "delivery" ? (
                    sale.delivery?.status
                  ) : columnKey === "payment" ? (
                    sale.payment?.amountPaid
                  ) : columnKey === "actions" ? (
                    <Button size="sm" color="danger" onClick={sale.delete}>
                      Delete
                    </Button>
                  ) : (
                    getKeyValue(sale, columnKey)
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
