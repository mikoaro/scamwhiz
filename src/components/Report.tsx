"use client";

import { Report as ReportModel } from "@prisma/client";
import { useState } from "react";
import AddEditReportDialog from "./AddEditReportDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import React from "react";

interface ReportProps {
  report: ReportModel;
}

export default function Report({ report }: ReportProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const wasUpdated = report.updatedAt > report.createdAt;

  const createdUpdatedAtTimestamp = (
    wasUpdated ? report.updatedAt : report.createdAt
  ).toDateString();

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle>{report.title}</CardTitle>
          <CardDescription>
            {createdUpdatedAtTimestamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{report.content}</p>
        </CardContent>
      </Card>
      <AddEditReportDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        reportToEdit={report}
      />
    </>
  );
}
