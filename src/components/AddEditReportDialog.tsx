import { CreateReportSchema, createReportSchema } from "@/lib/validation/report";
import { zodResolver } from "@hookform/resolvers/zod";
import { Report } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import LoadingButton from "./ui/loading-button";
import { Textarea } from "./ui/textarea";
import React from "react";

interface AddEditReportDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  reportToEdit?: Report;
}

export default function AddEditReportDialog({
  open,
  setOpen,
  reportToEdit,
}: AddEditReportDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const router = useRouter();

  const form = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      title: reportToEdit?.title || "",
      content: reportToEdit?.content || "",
    },
  });

  async function onSubmit(input: CreateReportSchema) {
    try {
      if (reportToEdit) {
        const response = await fetch("/api/reports", {
          method: "PUT",
          body: JSON.stringify({
            id: reportToEdit.id,
            ...input,
          }),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
      } else {
        const response = await fetch("/api/reports", {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function deleteReport() {
    if (!reportToEdit) return;
    setDeleteInProgress(true);
    try {
      const response = await fetch("/api/reports", {
        method: "DELETE",
        body: JSON.stringify({
          id: reportToEdit.id,
        }),
      });
      if (!response.ok) throw Error("Status code: " + response.status);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reportToEdit ? "Edit Report" : "Add Report"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report title</FormLabel>
                  <FormControl>
                    <Input placeholder="Report title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Report content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {reportToEdit && (
                <LoadingButton
                  variant="destructive"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deleteReport}
                  type="button"
                >
                  Delete report
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
