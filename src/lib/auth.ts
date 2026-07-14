import { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      accessToken?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "read:user user:follow" } },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as unknown as { username?: string }).username =
          (token as unknown as { username?: string }).username ?? session.user.name ?? undefined;
        
        session.user.accessToken = (token as unknown as { accessToken?: string }).accessToken;
      }
      return session;
    },
    async jwt({ token, profile, account }) {
      if (profile) {
        (token as unknown as { username: string }).username = (profile as unknown as { login: string }).login;
      }
      if (account) {
        (token as unknown as { accessToken: string }).accessToken = account.access_token ?? "";
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/build",
  },
};
