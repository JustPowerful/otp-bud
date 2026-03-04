import {
  applicationApi,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from "@/api/applicationApi";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

type CreateApplicationModalProps = {
  onCreated?: () => void;
  mode?: "create" | "edit";
  applicationId?: string;
};

const CreateApplicationModal = ({
  onCreated,
  mode = "create",
  applicationId,
}: CreateApplicationModalProps) => {
  const [isCreateToggle, setIsCreateToggle] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateApplicationRequest>({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const { mutate: createApplication, isPending: isCreateLoading } = useMutation(
    {
      mutationFn: async (data: CreateApplicationRequest) =>
        await applicationApi.createApplication(data),
      onSuccess: () => {
        reset();
        setIsCreateToggle(false);
        onCreated?.();
      },
      onError: (error) => {
        console.error("Failed to create application:", error);
      },
    },
  );

  const { mutate: updateApplication, isPending: isUpdateLoading } = useMutation(
    {
      mutationFn: async (data: UpdateApplicationRequest) => {
        if (!applicationId)
          throw new Error("Application ID is required for update");
        await applicationApi.updateApplication({
          ...data,
          applicationId,
        });
      },
      onSuccess: () => {
        reset();
        setIsCreateToggle(false);
        onCreated?.();
      },
      onError: (error) => {
        console.error("Failed to update application:", error);
      },
    },
  );

  const onSubmit = (data: CreateApplicationRequest) => {
    if (mode === "create") {
      createApplication(data);
    } else {
      updateApplication({
        ...data,
        applicationId: applicationId!,
      });
    }
  };
  return (
    <>
      <Button onClick={() => setIsCreateToggle(true)}>
        {mode === "create" ? "Create new application" : "Edit application"}
      </Button>
      <Modal
        isOpen={isCreateToggle}
        onOpenChange={(value) => setIsCreateToggle(value)}
        title={
          mode === "create" ? "Create a new application" : "Edit application"
        }
        description={
          mode === "create"
            ? "Fill in the details below to create a new application."
            : "Edit the details of your application below."
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Application name"
              className="w-full px-3 py-2 border rounded-md"
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              placeholder="Application description"
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
              {...register("description")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCreateToggle(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreateLoading || isUpdateLoading}>
              {isCreateLoading || isUpdateLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CreateApplicationModal;
