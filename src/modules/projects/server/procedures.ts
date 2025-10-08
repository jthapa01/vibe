import { z } from "zod";
import { generateSlug } from "random-word-slugs";

import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
  .input(z.object({ id: z.string().min(1, { message: "Project ID is required" }) }))
  .query(async ({ input }) => {
    const project = await prisma.project.findUnique({
      where: { id: input.id },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }
    return project;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string()
          .min(1, { message: "Value is required" })
          .max(10000, { message: "Value is too long" }),
      })
    )
    .mutation(async ({ input }) => {
      const projectName = generateSlug(2, { format: "kebab" });
      const project = await prisma.project.create({
        data: {
          name: projectName,
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });
      await inngest.send({
        name: "code-agent/run",
        data: { value: input.value, projectId: project.id },
      });
      return project;
    }),
});
