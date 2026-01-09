import { z } from 'zod';

export const GetProjectsQuerySchema = z.object({
    archived: z.enum(['true', 'false']).optional(),
    // status: z.string().optional(), // Future
    // q: z.string().optional(), // Future
});

export type GetProjectsQuery = z.infer<typeof GetProjectsQuerySchema>;

export const GetPromptsQuerySchema = z.object({
    archived: z.enum(['true', 'false']).optional(),
    // status: z.string().optional(), 
    // priority: z.string().optional(),
});

export type GetPromptsQuery = z.infer<typeof GetPromptsQuerySchema>;
