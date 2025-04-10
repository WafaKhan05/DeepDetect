import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileVideo, FileImage, Loader2Icon } from "lucide-react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound } from "next/navigation";
import TableActions from "./table-actions";

interface Upload {
  id: string;
  file_name: string;
  file_location: string;
  uploaded_on: string;
  file_type: string;
  status: string;
  confidence?: string | null;
  prediction?: string | null;
  result?: string | null;
}

interface Response {
  status: "error" | "success";
  message: string;
  uploads?: Upload[];
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HistoryPage() {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user) {
    notFound();
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/user-uploads/${user.id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user uploads");
  }

  const data: Response = await res.json();
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Analysis History</h1>
        <Button variant="outline">Export History</Button>
      </div>

      <div className="bg-background rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.uploads &&
              data.uploads.map((item) => (
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
                        item.status.toLowerCase() === "deepfake"
                          ? "destructive"
                          : item.status.toLowerCase() === "analyzing"
                            ? "secondary"
                            : "success"
                      }
                      className="flex justify-center items-center gap-4"
                    >
                      {item.status.toUpperCase()}
                      <Loader2Icon size={12} className="animate-spin" />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.confidence ? item.confidence + "%" : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableActions fileId={item.id} userId={user.id} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!data.uploads && (
          <div className="w-full h-32 flex justify-center items-center text-muted-foreground">
            No Uploads.
          </div>
        )}
      </div>
    </div>
  );
}
