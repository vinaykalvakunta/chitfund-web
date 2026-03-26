import express from 'express';
import cors from 'cors';
import { db } from './db';
import { 
  chitGroups, members, auctions, contributions, 
  insertChitGroupSchema, insertMemberSchema, insertAuctionSchema, insertContributionSchema 
} from '../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Utility for hashing local passwords
const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// --- CHIT GROUPS API ---
app.get('/api/groups', async (req, res) => {
  try {
    const allGroups = await db.select().from(chitGroups);
    res.json(allGroups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const data = insertChitGroupSchema.parse(req.body);
    const newGroup = await db.insert(chitGroups).values(data).returning();
    res.status(201).json(newGroup[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Invalid data' });
  }
});

// --- MEMBERS API ---
app.get('/api/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupMembers = await db.select().from(members).where(eq(members.groupId, Number(groupId)));
    res.json(groupMembers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const data = insertMemberSchema.parse(req.body);
    if (data.passwordHash) {
      data.passwordHash = hashPassword(data.passwordHash);
    }
    const newMember = await db.insert(members).values(data).returning();
    res.status(201).json(newMember[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Invalid data' });
  }
});

// --- AUCTIONS API ---
app.get('/api/groups/:groupId/auctions', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupAuctions = await db.select().from(auctions).where(eq(auctions.groupId, Number(groupId)));
    res.json(groupAuctions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auctions', async (req, res) => {
  try {
    const data = insertAuctionSchema.parse(req.body);
    const newAuction = await db.insert(auctions).values(data).returning();
    res.status(201).json(newAuction[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Invalid data' });
  }
});

// --- CONTRIBUTIONS API ---
app.get('/api/auctions/:auctionId/contributions', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auctionContributions = await db.select().from(contributions).where(eq(contributions.auctionId, Number(auctionId)));
    res.json(auctionContributions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contributions', async (req, res) => {
  try {
    const data = insertContributionSchema.parse(req.body);
    const newContribution = await db.insert(contributions).values(data).returning();
    res.status(201).json(newContribution[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Invalid data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
