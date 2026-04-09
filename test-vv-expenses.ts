import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
    const uri = process.env.ANTIGRAVITY_MONGODB_URI;
    if (!uri) throw new Error("No URL");
    
    // We parse the dbName from connection string or default to 'test'
    const client = new MongoClient(uri);
    await client.connect();
    
    // The DB for Viva Vegas is usually 'test' based on previous schema, let's just get the default DB
    const db = client.db();
    
    const expenses = await db.collection('expenses').find().toArray();
    console.log('Expenses count:', expenses.length);
    if (expenses.length > 0) {
        console.log(expenses.slice(0, 3));
    }
    
    await client.close();
}

run().catch(console.dir);
