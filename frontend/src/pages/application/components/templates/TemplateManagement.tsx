import CreateTemplateModal from "./CreateTemplateModal";
import TemplateRow from "./TemplateRow";
import { templateApi, type PaginateTemplatesResponse } from "@/api/templateApi";
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

/**
 * This is not a page, but a component used in the application management page.
 * It is responsible for managing the templates of an application, including creation, activation, deletion and pagination.
 */
type TemplateManagementProps = {
  applicationId?: string;
};

const TemplateManagement = ({ applicationId }: TemplateManagementProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 6;
  const queryClient = useQueryClient();

  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useQuery<PaginateTemplatesResponse>({
    queryKey: ["templates", applicationId, currentPage, pageLimit],
    queryFn: async () => {
      if (!applicationId) {
        throw new Error("Application ID is required to load templates");
      }
      return await templateApi.paginateTemplates(applicationId, {
        page: currentPage,
        limit: pageLimit,
        query: "",
      });
    },
    enabled: !!applicationId,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  const handleTemplateCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["templates", applicationId] });
    setCurrentPage(1);
  }, [applicationId, queryClient]);

  const templates = templatesResponse?.data || [];
  const meta = templatesResponse?.meta;
  const totalPages = meta?.totalPages || 1;

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
    <div className="mt-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Templates</h1>
          <p className="text-sm text-zinc-500">
            Here you can create, activate, delete and paginate through your
            templates.
          </p>
        </div>
        <CreateTemplateModal
          applicationId={applicationId}
          onCreated={handleTemplateCreated}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          Failed to load templates. Please try again.
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 text-muted-foreground">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No templates yet. Create your first template to get started.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {templates.map((template) => (
            <TemplateRow
              key={template.id}
              template={template}
              onChanged={handleTemplateCreated}
            />
          ))}
        </div>
      )}

      {templates.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
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
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
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
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
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
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
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
  );
};

export default TemplateManagement;
