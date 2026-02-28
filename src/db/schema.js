import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  foreignKey,
} from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Enum for match status
 * - scheduled: Match is scheduled but not yet started
 * - live: Match is currently in progress
 * - finished: Match has concluded
 */
export const matchStatusEnum = pgEnum('match_status', [
  'scheduled',
  'live',
  'finished',
]);

// ============================================================================
// TABLES
// ============================================================================

/**
 * Matches table - stores real-time sports match data
 */
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(), // e.g., 'cricket', 'football', 'basketball'
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').notNull().default('scheduled'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  homeScore: integer('home_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Commentary table - stores real-time commentary and events for matches
 */
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  minute: integer('minute'), // Match minute or timestamp
  sequence: integer('sequence'), // Event sequence number within a minute
  period: text('period'), // e.g., 'first_half', 'second_half', 'innings_1'
  eventType: text('event_type').notNull(), // e.g., 'wicket', 'boundary', 'goal', 'foul'
  actor: text('actor'), // Player or entity performing the action
  team: text('team'), // Team performing the action
  message: text('message').notNull(), // Human-readable commentary
  metadata: jsonb('metadata'), // Additional data (e.g., player stats, ball details)
  tags: text('tags').array(), // Categorization tags for filtering
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// TYPE EXPORTS (for TypeScript-like type inference in JavaScript)
// ============================================================================

/**
 * Type definitions for type-safe queries
 * Usage: const user = db.query.matches.findFirst(...)
 */
export const MatchSelect = matches.$inferSelect;
export const MatchInsert = matches.$inferInsert;
export const CommentarySelect = commentary.$inferSelect;
export const CommentaryInsert = commentary.$inferInsert;
