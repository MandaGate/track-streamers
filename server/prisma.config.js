// Prisma 7 configuration: provide datasource connection URL
export default {
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
};