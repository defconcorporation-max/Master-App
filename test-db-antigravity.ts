import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const mongoUri = process.env.ANTIGRAVITY_MONGODB_URI || '';

async function checkVivaVegas() {
    console.log("--- VIVA VEGAS DIAGNOSTICS ---");
    const mongoClient = new MongoClient(mongoUri);
    try {
        await mongoClient.connect();
        const db = mongoClient.db('travel-agency');
        
        // Sum converted quotes
        const revQuotes = await db.collection('quotes').aggregate([
            { $match: { status: 'converted' } },
            { $group: { _id: null, total: { $sum: "$totals.totalClientPrice" } } }
        ]).toArray();
        console.log(`Revenue from Quotes summary:`, revQuotes[0]?.total || 0);

        // Calculate from ItineraryItems (Cost + ServiceFee)
        const items = await db.collection('itineraryitems').find({}).toArray();
        let itRevenue = 0;
        let itProfit = 0;
        items.forEach(item => {
            const cost = item.cost || 0;
            const serviceFee = item.serviceFee || 0;
            const costPrice = item.costPrice || 0;
            const revenue = cost + serviceFee;
            itRevenue += revenue;
            
            let commission = 0;
            const commType = item.commissionType;
            const commValue = item.commissionValue || 0;
            if (commType === 'fixed') commission = commValue;
            else {
                const base = (item.type === 'service_fee') ? serviceFee : cost;
                commission = base * (commValue / 100);
            }
            itProfit += (revenue - costPrice) - commission;
        });

        console.log(`Revenue from ItineraryItems:`, itRevenue);
        console.log(`Gross Profit from ItineraryItems:`, itProfit);

    } finally {
        await mongoClient.close();
    }
}

checkVivaVegas();
