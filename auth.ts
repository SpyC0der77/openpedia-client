import NextAuth from "next-auth";
import Wikimedia from "next-auth/providers/wikimedia";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Wikimedia],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name ?? (token.username as string) ?? "Wikimedia User";
      }
      return session;
    },
    jwt({ token, profile }) {
      if (profile?.username) {
        token.username = profile.username;
      }
      return token;
    },
  },
  trustHost: true,
});
