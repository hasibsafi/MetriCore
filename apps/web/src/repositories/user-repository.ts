import { db } from "../lib/db";

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email
    },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      isMetriCoreAdmin: true
    }
  });
}

export async function createUserWithPassword(email: string, passwordHash: string) {
  return db.user.create({
    data: {
      email,
      passwordHash
    },
    select: {
      id: true,
      email: true
    }
  });
}

export async function updateUserPasswordHash(userId: string, passwordHash: string) {
  return db.user.update({
    where: {
      id: userId
    },
    data: {
      passwordHash
    },
    select: {
      id: true
    }
  });
}
