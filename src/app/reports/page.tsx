import Report from "@/components/Report";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ScamWhiz - Reports",
};

export default async function ReportsPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const allReports = await prisma.report.findMany({ where: { userId } });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allReports.map((report) => (
        <Report report={report} key={report.id} />
      ))}
      {allReports.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any reports yet. Why don't you create one?"}
        </div>
      )}
    </div>
  );
}
