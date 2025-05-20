"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "@/lib/types";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { FileImage, FileVideo, Loader2Icon } from "lucide-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import TableActions from "./table-actions";

interface Response {
  status: "error" | "success";
  message: string;
  uploads?: Upload[];
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function HistoryPage() {
  const [data, setData] = useState<Upload[]>([]);

  const { getUser, isLoading } = useKindeBrowserClient();

  const user = getUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      notFound();
    }

    if (user.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/user-uploads/${user.id}`, {
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => setData(data.uploads ?? []));

      const WebSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT;

      const ws = new WebSocket(`${WebSocketUrl}/${user.id}`);

      ws.onmessage = function (event) {
        console.log("WebSocket Message:", event.data);

        const data = JSON.parse(event.data);

        if (data.event === "update_status") {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === data.data.id ? { ...item, ...data.data } : item
            )
          );
        }
      };
    }
  }, [user, isLoading]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Analysis History</h1>
      </div>

      <div className="bg-background rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Analysis Completed On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {user &&
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.file_type === "video" ? (
                        <FileVideo className="w-4 h-4" />
                      ) : (
                        <FileImage className="w-4 h-4" />
                      )}
                      {item.file_name}
                    </div>
                  </TableCell>
                  <TableCell>{item.uploaded_on.split(".")[0]}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status.toLowerCase() === "analyzing"
                          ? "secondary"
                          : "outline"
                      }
                      className="flex justify-center items-center gap-4"
                    >
                      {item.status.toUpperCase()}
                      {item.status.toLowerCase() === "analyzing" && (
                        <Loader2Icon size={12} className="animate-spin" />
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.prediction ? (
                      <Badge
                        variant={
                          item.prediction?.toLowerCase() === "fake"
                            ? "destructive"
                            : "success"
                        }
                        className="flex justify-center items-center gap-4"
                      >
                        {item.prediction?.toUpperCase() ?? "-"}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {item.confidence ? item.confidence : "-"}
                  </TableCell>
                  <TableCell>
                    {item.analysis_completed_on?.split(".")?.[0] ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableActions
                      fileId={item.id}
                      userId={user.id as string}
                      setData={setData}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!data.length && (
          <div className="w-full h-32 flex justify-center items-center text-muted-foreground">
            No Uploads.
          </div>
        )}
      </div>
    </div>
  );
}
