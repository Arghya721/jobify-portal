"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface RevokeButtonProps {
  tokenId: number;
  accessToken: string;
  apiUrl: string;
}

export function RevokeButton({ tokenId, accessToken, apiUrl }: RevokeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRevoke = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/sessions/${tokenId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        // Refresh the page to update the server component's session list
        router.refresh();
      } else {
        alert("Failed to revoke session");
      }
    } catch (e) {
      console.error(e);
      alert("Network error revoking session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleRevoke}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Revoking..." : "Revoke"}
    </Button>
  );
}
