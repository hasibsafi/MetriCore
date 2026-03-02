import { hashPassword, verifyPassword } from "../lib/password";
import { createUserWithPassword, findUserByEmail } from "../repositories/user-repository";

export async function createPasswordUser(input: { email: string; password: string }) {
  const email = input.email.toLowerCase();
  const existing = await findUserByEmail(email);

  if (existing) {
    return { ok: false as const, reason: "email_exists" as const };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUserWithPassword(email, passwordHash);

  return { ok: true as const, user };
}

export async function verifyCredentials(input: { email: string; password: string }) {
  const email = input.email.toLowerCase();
  const user = await findUserByEmail(email);

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isMetriCoreAdmin: user.isMetriCoreAdmin
  };
}
