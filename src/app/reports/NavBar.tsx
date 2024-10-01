"use client";

import logo from "@/assets/logo.png";
import AIChatButton from "@/components/AIChatButton";
import AddEditReportDialog from "@/components/AddEditReportDialog";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useState } from "react";

export default function NavBar() {
  const { theme } = useTheme();

  const [showAddEditReportDialog, setShowAddEditReportDialog] = useState(false);

  return (
    <>
      <div className="p-4 shadow">
        <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/reports" className="flex items-center gap-1">
            <Image src={logo} alt="ScamWhiz logo" width={40} height={40} />
            <span className="font-bold">ScamWhiz</span>
          </Link>
          <div className="flex items-center gap-2">
            <UserButton
              
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <ThemeToggleButton />
            <Button onClick={() => setShowAddEditReportDialog(true)}>
              <Plus size={20} className="mr-2" />
              Report Scammer
            </Button>
            <AIChatButton />
          </div>
        </div>
      </div>
      <AddEditReportDialog
        open={showAddEditReportDialog}
        setOpen={setShowAddEditReportDialog}
      />
    </>
  );
}
