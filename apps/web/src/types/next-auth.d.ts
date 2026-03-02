import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isMetriCoreAdmin: boolean;
    };
  }

  interface User {
    isMetriCoreAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isMetriCoreAdmin?: boolean;
  }
}
