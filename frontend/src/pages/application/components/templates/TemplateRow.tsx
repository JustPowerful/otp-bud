import { templateApi, type Template } from "@/api/templateApi";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CreateTemplateModal from "./CreateTemplateModal";
import RemoveTemplateModal from "./RemoveTemplateModal";

type TemplateRowProps = {
  template: Template;
  onChanged?: () => void;
};

const TemplateRow = ({ template, onChanged }: TemplateRowProps) => {
  const queryClient = useQueryClient();

  const invalidateTemplates = () => {
    onChanged?.();
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  const { mutate: activateTemplate, isPending: isActivating } = useMutation({
    mutationFn: async () => await templateApi.activateTemplate(template.id),
    onSuccess: invalidateTemplates,
    onError: (error) => {
      console.error("Failed to activate template:", error);
    },
  });

  const isBusy = isActivating;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold">{template.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {template.subject}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {template.isActive ? "Active" : "Inactive"}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => activateTemplate()}
          disabled={template.isActive || isBusy}
        >
          {isActivating ? "Activating..." : "Set Active"}
        </Button>
        <CreateTemplateModal
          mode="edit"
          templateId={template.id}
          triggerLabel="Edit"
          onCreated={invalidateTemplates}
        />
        <RemoveTemplateModal
          template={template}
          onChanged={invalidateTemplates}
        />
      </div>
    </div>
  );
};

export default TemplateRow;
