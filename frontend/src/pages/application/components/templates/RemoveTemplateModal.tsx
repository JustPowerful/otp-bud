import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { templateApi, type Template } from "@/api/templateApi";
import { useQueryClient } from "@tanstack/react-query";

const RemoveTemplateModal = ({
  template,
  onChanged,
}: {
  template: Template;
  onChanged?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const invalidateTemplates = () => {
    onChanged?.();
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    setIsOpen(false);
  };

  const { mutate: removeTemplate, isPending: isRemoving } = useMutation({
    mutationFn: async () => await templateApi.removeTemplate(template.id),
    onSuccess: invalidateTemplates,
    onError: (error) => {
      console.error("Failed to remove template:", error);
    },
  });

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        Remove
      </Button>
      <Modal
        title="Remove Template"
        description="Do you want to remove this template? This action cannot be undone."
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={isRemoving}
            variant="destructive"
            onClick={() => {
              removeTemplate();
            }}
          >
            {isRemoving ? "Removing..." : "Confirm Remove"}
          </Button>
          <Button
            disabled={isRemoving}
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default RemoveTemplateModal;
