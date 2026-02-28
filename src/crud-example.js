import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('🏟️  Performing CRUD operations for Sports Application...\n')
    console.log('📝 Creating a new match...');
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'cricket',
        homeTeam: 'India',
        awayTeam: 'Australia',
        status: 'live',
        startTime: new Date(),
        homeScore: 45,
        awayScore: 38,
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }
    
    console.log('✅ CREATE: New match created:', newMatch);

    // ========== READ MATCH ==========
    console.log('\n📖 Reading the match...');
    const foundMatch = await db
      .select()
      .from(matches)
      .where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match:', foundMatch[0]);

    // ========== CREATE COMMENTARY ==========
    console.log('\n✍️  Adding commentary to the match...');
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 45,
        sequence: 1,
        period: 'first_half',
        eventType: 'boundary',
        actor: 'Virat Kohli',
        team: 'India',
        message: 'Excellent four through the covers!',
        metadata: { runs: 4, ballType: 'full_length', bowler: 'Josh Hazlewood' },
        tags: ['batting', 'boundary', 'four'],
      })
      .returning();

    if (!newCommentary) {
      throw new Error('Failed to create commentary');
    }

    console.log('✅ CREATE: Commentary added:', newCommentary);

    // ========== READ COMMENTARY ==========
    console.log('\n📖 Reading the commentary...');
    const foundCommentary = await db
      .select()
      .from(commentary)
      .where(eq(commentary.id, newCommentary.id));
    console.log('✅ READ: Found commentary:', foundCommentary[0]);

    // ========== UPDATE MATCH ==========
    console.log('\n🔄 Updating match status to finished...');
    const [updatedMatch] = await db
      .update(matches)
      .set({ 
        status: 'finished',
        homeScore: 265,
        awayScore: 258,
        endTime: new Date()
      })
      .where(eq(matches.id, newMatch.id))
      .returning();
    
    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }
    
    console.log('✅ UPDATE: Match updated:', updatedMatch);

    // ========== UPDATE COMMENTARY ==========
    console.log('\n🔄 Updating commentary...');
    const [updatedCommentary] = await db
      .update(commentary)
      .set({ message: 'Stunning four! The crowd goes wild!' })
      .where(eq(commentary.id, newCommentary.id))
      .returning();
    
    if (!updatedCommentary) {
      throw new Error('Failed to update commentary');
    }
    
    console.log('✅ UPDATE: Commentary updated:', updatedCommentary);

    // ========== DELETE COMMENTARY ==========
    console.log('\n🗑️  Deleting the commentary...');
    await db.delete(commentary).where(eq(commentary.id, newCommentary.id));
    console.log('✅ DELETE: Commentary deleted.');

    // ========== DELETE MATCH ==========
    console.log('\n🗑️  Deleting the match...');
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE: Match deleted.');

    console.log('\n✅ All CRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    if (pool) {
      await pool.end();
      console.log('\n🔌 Database pool closed.');
    }
  }
}

main();
