import { PrismaClient } from '@/db/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const connectionString = process.env.DATABASE_URL
console.log("connectionString", connectionString)

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool.options)
// const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })

// export default prisma;