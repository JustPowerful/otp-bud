import { applicationApi } from "@/api/applicationApi";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const DeleteApplicationModal = ({
  applicationId,
  onDeleted,
}: {
  applicationId: string;
  onDeleted?: () => void;
}) => {
  const [isToggled, setIsToggled] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: async () => applicationApi.removeApplication({ applicationId }),
    onSuccess: () => {
      setIsToggled(false);
      onDeleted?.();
    },
    onError: (error) => {
      console.error("Failed to delete application:", error);
    },
  });
  return (
    <>
      <Button variant="destructive" onClick={() => setIsToggled(true)}>
        Delete application
      </Button>
      <Modal
        isOpen={isToggled}
        onOpenChange={setIsToggled}
        title="Delete application"
        description="Are you sure you want to delete this application? This action cannot be undone."
      >
        <div className="grid grid-cols-2 gap-2">
          <Button variant="destructive" onClick={() => deleteMutation.mutate()}>
            Delete
          </Button>
          <Button
            onClick={() => {
              setIsToggled(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default DeleteApplicationModal;
