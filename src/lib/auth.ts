import { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "read:user" } },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as unknown as { username?: string }).username =
          (token as unknown as { username?: string }).username ?? session.user.name ?? undefined;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        (token as unknown as { username: string }).username = (profile as unknown as { login: string }).login;
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/build",
  },
};
