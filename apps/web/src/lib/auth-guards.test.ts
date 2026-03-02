import { MembershipRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { isRoleAllowed } from "./rbac";

describe("isRoleAllowed", () => {
  it("returns true when role is in allowed list", () => {
    expect(isRoleAllowed(MembershipRole.admin, [MembershipRole.owner, MembershipRole.admin])).toBe(true);
  });

  it("returns false when role is not in allowed list", () => {
    expect(isRoleAllowed(MembershipRole.viewer, [MembershipRole.owner, MembershipRole.admin])).toBe(false);
  });
});
