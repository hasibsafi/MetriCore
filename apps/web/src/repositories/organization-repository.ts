import { db } from "../lib/db";

export async function createOrganization(name: string) {
  return db.organization.create({
    data: {
      name
    },
    select: {
      id: true,
      name: true
    }
  });
}
