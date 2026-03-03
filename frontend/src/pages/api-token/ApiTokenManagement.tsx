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
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const revokeMutation = useMutation({
    mutationFn: (token: string) => tokenApi.revokeToken({ token }),
    onSuccess: () => {
      // Invalidate all token queries to refetch on any page
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
      revokeMutation.mutate(token);
    },
    [revokeMutation],
  );

  const tokens = tokensResponse?.data || [];
  const meta = tokensResponse?.meta;
  const totalPages = meta ? Math.ceil(meta.total / pageLimit) : 1;

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfWindow = 2;
    const startPage = Math.max(1, currentPage - halfWindow);
    const endPage = Math.min(totalPages, currentPage + halfWindow);

    if (startPage > 1) {
      pages.push(1);
    }

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    if (endPage < totalPages) {
      pages.push(totalPages);
    }

    return pages;
  };

  const paginationPages = getPaginationPages();

  return (
    <>
      {/* Revoke Modal */}
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={`cursor-pointer ${
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  />
                </PaginationItem>

                {totalPages <= 5 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentPage(page);
                          }}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )
                ) : (
                  <>
                    {paginationPages.map((page, index) =>
                      page === "..." ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCurrentPage(page as number);
                            }}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={`cursor-pointer ${
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
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
    </>
  );
};

export default ApiTokenManagement;
