import CreateApplicationModal from "./components/CreateApplicationModal";
import {
  applicationApi,
  type PaginateApplicationsResponse,
} from "@/api/applicationApi";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import ApplicationPreview from "./components/ApplicationPreview";

const ApplicationManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 6;
  const queryClient = useQueryClient();

  const {
    data: applicationsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginateApplicationsResponse>({
    queryKey: ["applications", currentPage, pageLimit],
    queryFn: async () =>
      (
        await applicationApi.paginateApplications({
          page: currentPage,
          limit: pageLimit,
          query: "",
        })
      ).data,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  const handleApplicationCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["applications"] });
    setCurrentPage(1);
  }, [queryClient]);

  const applications = applicationsResponse?.data || [];
  const meta = applicationsResponse?.meta;
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
      <div className="p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold">Application Management</h1>
          <CreateApplicationModal onCreated={handleApplicationCreated} />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive rounded-md p-4 mb-4">
            <p>Failed to load applications. Please try again.</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-muted-foreground">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
            No applications yet. Create your first application to get started.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <ApplicationPreview
                key={application.id}
                application={application}
                refetch={refetch}
              />
            ))}
          </div>
        )}

        {applications.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
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
      </div>
    </>
  );
};

export default ApplicationManagement;
