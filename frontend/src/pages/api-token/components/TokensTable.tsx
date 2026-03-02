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

  return (
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
                  {truncateToken(token.token)}
                </TableCell>
                <TableCell className="text-sm">{token.id}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(token.expiresAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRevoke(token.token)}
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
  );
};
