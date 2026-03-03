import {Router} from 'express'
import { createMatchSchema, listMatchesSchema } from '../validation/matches.js'

import { db } from '../db/db.js'
import { matches } from '../db/schema.js'
import { MATCH_STATUS } from '../validation/matches.js'

export const matchRouter = Router();

function getMatchStatus(startTime, endTime) {
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (now < start) return MATCH_STATUS.SCHEDULED;
    if (now >= start && now < end) return MATCH_STATUS.LIVE;
    return MATCH_STATUS.FINISHED;
}

const MAX_LIMIT = 100;
matchRouter.get('/', async (req,res) =>{
    const parsed = listMatchesSchema.safeParse(req.query)
    if(!parsed.success){
        return res.status(400).json({error:parsed.error.errors[0].message})
    }
    const limit = Math.min(parsed.data.limit ?? 50 , MAX_LIMIT)
    try{
        const list = await db.select().from(matches).orderBy(matches.createdAt).limit(limit)
        res.status(200).json({data: list})
    }catch(e){
        res.status(500).json({error:"Internal Server Error"})
    }
})

matchRouter.post('/', async (req,res) =>{
    const parsed = createMatchSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({error:parsed.error.errors[0].message})
    }
    
    const {data: {startTime, endTime, homeScore, awayScore}} = parsed;

    try{
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();
        res.status(201).json({data: event})
    }catch (e){
        res.status(500).json({error:"Internal Server Error", details: e.message ?? String(e)})
    }
})
