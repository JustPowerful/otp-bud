import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CreateTokenModal from "./components/CreateTokenModal";
import { TokensTable } from "./components/TokensTable";
import { tokenApi, type PaginateTokensResponse } from "@/api/tokenApi";

const ApiTokenManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 5;
  const queryClient = useQueryClient();

  const {
    data: tokensResponse,
    isLoading,
    error,
  } = useQuery<PaginateTokensResponse>({
    queryKey: ["tokens", currentPage, pageLimit],
    queryFn: () =>
      tokenApi.paginateTokens({
        page: currentPage,
        limit: pageLimit,
      }),
  });

  const revokeMutation = useMutation({
    mutationFn: (token: string) => tokenApi.revokeToken({ token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
    onError: (error) => {
      console.error("Failed to revoke token:", error);
    },
  });

  const handleTokenCreated = useCallback(() => {
    // Invalidate and refetch tokens
    queryClient.invalidateQueries({ queryKey: ["tokens"] });
    setCurrentPage(1);
  }, [queryClient]);

  const handleRevoke = useCallback(
    (token: string) => {
      if (confirm("Are you sure you want to revoke this token?")) {
        revokeMutation.mutate(token);
      }
    },
    [revokeMutation],
  );

  const tokens = tokensResponse?.data || [];
  const meta = tokensResponse?.meta;
  const totalPages = meta ? Math.ceil(meta.total / pageLimit) : 1;

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">API Token Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Create a new API token
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive rounded-md p-4 mb-4">
          <p>Failed to load tokens. Please try again.</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <TokensTable
          tokens={tokens}
          onRevoke={handleRevoke}
          isLoading={isLoading}
        />
      </div>

      {tokens.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {totalPages <= 5 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )
              ) : (
                <>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(1);
                      }}
                      isActive={1 === currentPage}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage - 1);
                        }}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive
                      onClick={(e) => e.preventDefault()}
                    >
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage + 1);
                        }}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(totalPages);
                      }}
                      isActive={totalPages === currentPage}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <CreateTokenModal
        toggle={isModalOpen}
        setToggle={setIsModalOpen}
        onTokenCreated={handleTokenCreated}
      />
    </div>
  );
};

export default ApiTokenManagement;
