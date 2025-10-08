import { withAuth } from "next-auth/middleware"

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // `/dashboard` requires auth
      if (req.nextUrl.pathname.startsWith("/dashboard")) {
        return !!token
      }
      // `/series` requires auth
      if (req.nextUrl.pathname.startsWith("/series")) {
        return !!token
      }
      // `/themes` requires auth
      if (req.nextUrl.pathname.startsWith("/themes")) {
        return !!token
      }
      // `/api/series` requires auth
      if (req.nextUrl.pathname.startsWith("/api/series")) {
        return !!token
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  // Match all paths except public ones
  matcher: [
    "/dashboard/:path*",
    "/series/:path*",
    "/themes/:path*",
    "/api/series/:path*",
  ],
}
