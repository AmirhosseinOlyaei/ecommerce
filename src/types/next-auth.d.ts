import { User } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: User["role"];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: User["role"];
  }
}
