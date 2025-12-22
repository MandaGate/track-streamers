/* eslint-disable */
// Seed initial data into Postgres via Prisma, parsing a SQL backup file.
// Configure path via SEED_SQL_PATH (defaults to ../../streamers_backup.sql).

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseStreamers(sql) {
    const rows = [];
    const re =
        /INSERT INTO public\.streamers VALUES \('([^']*)', '([^']*)', '([^']*)', '([^']*)'\);/g;
    let m;
    while ((m = re.exec(sql)) !== null) {
        const [_, id, name, platform, created_at] = m;
        rows.push({ id, name, platform, created_at: new Date(created_at) });
    }
    return rows;
}

function parseHistory(sql) {
    const rows = [];
    const re =
        /INSERT INTO public\.subscriber_history VALUES \('([^']*)', '([^']*)', (\d+), (\d+), '([^']*)'\);/g;
    let m;
    while ((m = re.exec(sql)) !== null) {
        const [_, id, streamer_id, count, timestamp, created_at] = m;
        rows.push({
            id,
            streamer_id,
            count: Number(count),
            timestamp: BigInt(timestamp),
            created_at: new Date(created_at),
        });
    }
    return rows;
}

async function main() {
    const backupPath =
        process.env.SEED_SQL_PATH || path.resolve(__dirname, '../../streamers_backup.sql');
    if (!fs.existsSync(backupPath)) {
        console.warn(`Seed SQL file not found at: ${backupPath}. Skipping seed.`);
        return;
    }
    const sql = fs.readFileSync(backupPath, 'utf8');

    const streamers = parseStreamers(sql);
    const history = parseHistory(sql);

    if (streamers.length === 0 && history.length === 0) {
        console.warn('No rows parsed from SQL. Check file format.');
        return;
    }

    console.log(`Parsed ${streamers.length} streamers, ${history.length} history rows. Seeding...`);

    // Insert streamers first
    if (streamers.length > 0) {
        await prisma.streamer.createMany({ data: streamers, skipDuplicates: true });
    }

    // Then insert subscriber history
    if (history.length > 0) {
        await prisma.subscriberHistory.createMany({ data: history, skipDuplicates: true });
    }

    console.log('✅ Seed completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
