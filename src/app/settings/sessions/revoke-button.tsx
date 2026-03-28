"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface RevokeButtonProps {
  tokenId: number;
}

export function RevokeButton({ tokenId }: RevokeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRevoke = async () => {
    setLoading(true);
    try {
      const { revokeSessionAction } = await import("./actions");
      const res = await revokeSessionAction(tokenId);

      if (res.success) {
        // Revalidate handles server updates, this refreshes client layout gracefully
        router.refresh();
      } else {
        alert(res.message || "Failed to revoke session");
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
