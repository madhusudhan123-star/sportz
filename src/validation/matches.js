import { z } from 'zod';

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

export const listMatchesSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z.object({
  sport: z.string().trim().min(1, 'sport must be a non-empty string'),
  homeTeam: z.string().trim().min(1, 'homeTeam must be a non-empty string'),
  awayTeam: z.string().trim().min(1, 'awayTeam must be a non-empty string'),
  startTime: z.string().refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d.toISOString() === val;
  }, {
    message: 'startTime must be a valid ISO date string',
  }),
  endTime: z.string().refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d.toISOString() === val;
  }, {
    message: 'endTime must be a valid ISO date string',
  }),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
}).superRefine((data, ctx) => {
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();
  if (!isNaN(start) && !isNaN(end) && end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endTime must be chronologically after startTime',
      path: ['endTime'],
    });
  }
});

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
