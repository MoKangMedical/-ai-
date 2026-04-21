import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as kimi from "./kimi";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDocuments(ctx.user.id);
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      return db.getDocumentById(input.id, ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({ title: z.string().min(1).max(255), content: z.string() })).mutation(async ({ ctx, input }) => {
      await db.createDocument(ctx.user.id, input.title, input.content);
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({ id: z.number(), title: z.string().min(1).max(255).optional(), content: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      await db.updateDocument(id, ctx.user.id, updates);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteDocument(input.id, ctx.user.id);
      return { success: true };
    }),
  }),
  ai: router({
    translate: protectedProcedure.input(z.object({ text: z.string(), targetLang: z.enum(["en", "zh"]), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.translateText(input.text, input.targetLang);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "translate", input.text, result, { targetLang: input.targetLang });
      return { result };
    }),
    polish: protectedProcedure.input(z.object({ text: z.string(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.polishText(input.text);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "polish", input.text, result);
      return { result };
    }),
    checkGrammar: protectedProcedure.input(z.object({ text: z.string(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.checkGrammar(input.text);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "grammar", input.text, result);
      return { result };
    }),
    correctTense: protectedProcedure.input(z.object({ text: z.string(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.correctTense(input.text);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "tense", input.text, result);
      return { result };
    }),
    convertEnglish: protectedProcedure.input(z.object({ text: z.string(), variant: z.enum(["british", "american"]), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.convertEnglishVariant(input.text, input.variant);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "englishVariant", input.text, result, { variant: input.variant });
      return { result };
    }),
    optimizeSentence: protectedProcedure.input(z.object({ text: z.string(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.optimizeSentence(input.text);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "optimize", input.text, result);
      return { result };
    }),
    enhanceCoherence: protectedProcedure.input(z.object({ text: z.string(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.enhanceCoherence(input.text);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "coherence", input.text, result);
      return { result };
    }),
    improveParagraph: protectedProcedure.input(z.object({ text: z.string(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.improveParagraph(input.text);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "paragraph", input.text, result);
      return { result };
    }),
    continueWriting: protectedProcedure.input(z.object({ context: z.string(), instruction: z.string().optional(), documentId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const result = await kimi.continueWriting(input.context, input.instruction);
      await db.saveAiHistory(ctx.user.id, input.documentId ?? null, "continue", input.context, result, { instruction: input.instruction });
      return { result };
    }),
    history: protectedProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ ctx, input }) => {
      return db.getUserAiHistory(ctx.user.id, input.limit);
    }),
  }),
});

export type AppRouter = typeof appRouter;
