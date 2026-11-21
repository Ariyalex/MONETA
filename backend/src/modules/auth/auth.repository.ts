import { prisma } from "../../config/prisma.js";

export const authRepository = {
  findByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
      },
      // password hash hanya diperlukan ketika login
      select: {
        id: true,
        username: true,
        passwordHash: true,
      },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });
  },
};
