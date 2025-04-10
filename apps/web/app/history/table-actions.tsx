"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Response {
  status: "error" | "success";
  message: String;
}

const TableActions = ({
  fileId,
  userId,
}: {
  fileId: string;
  userId: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const downloadFile = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/file/${fileId}/${userId}`
    );
    // axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/file/${fileId}/${userId}`);
  };

  const deleteFile = async () => {
    setIsDeleting(true);

    const { data } = await axios.delete<Response>(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/file/${fileId}/${userId}`
    );

    setIsDeleting(false);

    if (data.status === "success") {
      router.refresh();
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={downloadFile}
        disabled={isDeleting}
      >
        <Download className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={deleteFile}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

export default TableActions;
