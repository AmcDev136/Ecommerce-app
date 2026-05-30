import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// NextAuth maneja Get y POST en este endpoint
export { handler as GET, handler as POST };