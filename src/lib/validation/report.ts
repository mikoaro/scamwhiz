import { z } from "zod";

export const createReportSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
});

export type CreateReportSchema = z.infer<typeof createReportSchema>;

export const updateReportSchema = createReportSchema.extend({
  id: z.string().min(1),
});

export const deleteReportSchema = z.object({
  id: z.string().min(1),
});
