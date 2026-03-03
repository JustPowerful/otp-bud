import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Token } from "@/api/tokenApi";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";

interface TokensTableProps {
  tokens: Token[];
  onRevoke: (token: string) => void;
  isLoading?: boolean;
}

export const TokensTable = ({
  tokens,
  onRevoke,
  isLoading = false,
}: TokensTableProps) => {
  const [toggleDelete, setToggleDelete] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const truncateToken = (token: string) => {
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  const toggleReveal = (tokenId: string) => {
    setRevealedTokens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
  };

  return (
    <>
      <Modal
        isOpen={toggleDelete}
        onOpenChange={(value) => {
          setToggleDelete(value);
          if (!value) setSelectedToken(null);
        }}
        title="Do you want to delete this token?"
        description="This will permanently delete the token and cannot be undone."
      >
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setToggleDelete(false);
              setSelectedToken(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setToggleDelete(false);
              if (selectedToken) {
                onRevoke(selectedToken.token);
              }
              setSelectedToken(null);
            }}
          >
            Revoke
          </Button>
        </div>
      </Modal>
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {tokens.length === 0 && !isLoading
              ? "No API tokens found"
              : "Your API tokens"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading tokens...
                </TableCell>
              </TableRow>
            ) : tokens.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No tokens yet. Create your first API token.
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span>
                        {revealedTokens.has(token.id)
                          ? token.token
                          : truncateToken(token.token)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReveal(token.id)}
                          className="h-6 w-6 p-0"
                        >
                          {revealedTokens.has(token.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.token)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{token.id}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(token.expiresAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedToken(token);
                        setToggleDelete(true);
                      }}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
