"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export function ForceLogout() {
  useEffect(() => {
    // Execute a standard sign out. 
    // This will clear the session and reload the current page.
    // If the page is protected, your server/middleware will naturally redirect them to /login.
    // If it's a public page (like /jobs), they will simply stay where they are, now logged out.
    signOut();
  }, []);

  return null;
}
