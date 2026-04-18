import prisma from './lib/prisma.js';

async function checkTables() {
    try {
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
        console.log('Tables in public schema:', tables);
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
