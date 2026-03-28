import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
// 1. Initial Sign-In Event
      if (account && user) {
        console.log("NextAuth received Google Tokens. Exchanging with backend...");
        
        try {
          const { headers: getHeaders } = await import("next/headers");
          const reqHeaders = await getHeaders();
          
          // Forward Real Headers or use Mocks for Local Dev Testing
          const userAgent = reqHeaders.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Local Dev) Chrome/120";
          const ipAddr = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
          const country = reqHeaders.get("x-appengine-country") || "US";
          const city = reqHeaders.get("x-appengine-city") || "San Francisco";

          // ==========================================
          // INTEGRATING WITH REAL BACKEND
          // ==========================================
          const apiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
          const res = await fetch(`${apiUrl}/api/auth/google/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "User-Agent": userAgent,
              "X-Forwarded-For": ipAddr,
              "X-Custom-Country": country,
              "X-Custom-City": city
            },
            body: JSON.stringify({ 
              idToken: account.id_token,
              email: user.email,
              name: user.name,
              picture: user.image
            })
          });
          
          if (!res.ok) {
            console.error(`Backend returned ${res.status}: ${res.statusText}`);
            throw new Error("Backend authentication failed");
          }
          
          const backendData = await res.json();
          
          // Save the custom backend JWT into NextAuth's encrypted cookie
          token.accessToken = backendData.accessToken;
          token.refreshToken = backendData.refreshToken; // If your backend issues one
        } catch (error) {
          console.error("Backend login exchange error", error);
          // Return null or undefined to reject the login if backend fails
        }
      }

      // 2. Token Refresh Logic
      // Check if the current backend JWT is expired
      if (token.accessToken && typeof token.accessToken === "string") {
        const decoded = parseJwt(token.accessToken);
        
        // If we successfully decoded it and it has an expiration time
        if (decoded && decoded.exp) {
          // If the token expires in less than 30 seconds from now
          if (Date.now() > (decoded.exp * 1000) - 30000) {
            console.log("Backend JWT expired or expiring soon. Refreshing...");
            
            try {
              const apiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
              const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  refreshToken: token.refreshToken 
                })
              });
              
              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                token.accessToken = refreshData.accessToken;
                
                // If backend gives us a rotating refresh token, update it too
                if (refreshData.refreshToken) {
                  token.refreshToken = refreshData.refreshToken;
                }
              } else {
                console.error(`Backend refresh failed with ${refreshRes.status}: ${refreshRes.statusText}`);
                token.error = "RefreshAccessTokenError"; 
              }
            } catch (error) {
              console.error("Refresh exchange network error:", error);
              token.error = "RefreshAccessTokenError";
            }
          }
        }
      }

      return token;
    },
    
    async session({ session, token }) {
      // 3. Make the Custom Backend JWT available to the Next.js frontend
      // Important: Use type assertion or augment the NextAuth Session type natively
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      if (token.error) {
        (session as any).error = token.error;
      }
      return session;
    },
  },
});

// Helper function to decode JWTs without needing an external library
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
