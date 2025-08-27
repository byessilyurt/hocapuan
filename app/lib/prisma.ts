import { PrismaClient } from "../generated/prisma";

declare global {
  // no-var: using var to attach to Node.js global for dev hot-reload safety
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}


