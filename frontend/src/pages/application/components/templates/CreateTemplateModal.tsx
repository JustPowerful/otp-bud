import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  templateApi,
  type CreateTemplateRequest,
  type GetTemplateDetailsResponse,
  type UpdateTemplateRequest,
} from "@/api/templateApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type CreateTemplateModalProps = {
  applicationId?: string;
  templateId?: string;
  mode?: "create" | "edit";
  onCreated?: () => void;
  triggerLabel?: string;
};

const CreateTemplateModal = ({
  applicationId,
  templateId,
  mode = "create",
  onCreated,
  triggerLabel,
}: CreateTemplateModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateRequest>({
    defaultValues: {
      name: "",
      subject: "",
      body: "",
    },
  });

  const {
    data: templateDetails,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useQuery<GetTemplateDetailsResponse>({
    queryKey: ["template", templateId],
    queryFn: async () => await templateApi.getTemplateDetails(templateId || ""),
    enabled: mode === "edit" && !!templateId,
  });

  useEffect(() => {
    if (templateDetails?.data && mode === "edit") {
      reset({
        name: templateDetails.data.name,
        subject: templateDetails.data.subject,
        body: templateDetails.data.body,
      });
    }
  }, [templateDetails, mode, reset]);

  const { mutate: createTemplate, isPending: isCreateLoading } = useMutation({
    mutationFn: async (data: CreateTemplateRequest) => {
      if (!applicationId) {
        throw new Error("Application ID is required to create a template");
      }
      return await templateApi.createTemplate(applicationId, data);
    },
    onSuccess: () => {
      reset();
      setIsOpen(false);
      onCreated?.();
    },
    onError: (error) => {
      console.error("Failed to create template:", error);
    },
  });

  const { mutate: updateTemplate, isPending: isUpdateLoading } = useMutation({
    mutationFn: async (data: UpdateTemplateRequest) => {
      if (!templateId) {
        throw new Error("Template ID is required to update a template");
      }
      return await templateApi.updateTemplate(templateId, data);
    },
    onSuccess: () => {
      reset();
      setIsOpen(false);
      onCreated?.();
    },
    onError: (error) => {
      console.error("Failed to update template:", error);
    },
  });

  const onSubmit = (data: CreateTemplateRequest) => {
    if (mode === "create") {
      createTemplate(data);
      return;
    }

    updateTemplate(data);
  };

  const isSubmitting = isCreateLoading || isUpdateLoading;
  const buttonLabel =
    triggerLabel || (mode === "create" ? "Create Template" : "Edit Template");

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{buttonLabel}</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={
          mode === "create"
            ? "Create your email template"
            : "Edit your email template"
        }
        description={
          mode === "create"
            ? "Create a new email template for this application."
            : "Update the fields below to change your email template."
        }
      >
        {templateError && (
          <div className="bg-destructive/10 text-destructive border border-destructive rounded-md p-3 mb-4">
            Failed to load template details. Please try again.
          </div>
        )}

        {mode === "edit" && isTemplateLoading ? (
          <div className="text-muted-foreground">
            Loading template details...
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                placeholder="Welcome email"
                className="w-full px-3 py-2 border rounded-md"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                placeholder="Your OTP code"
                className="w-full px-3 py-2 border rounded-md"
                {...register("subject", {
                  required: "Subject is required",
                })}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Body</label>
              <textarea
                placeholder="Hi {{name}}, your OTP code is {{code}}"
                className="w-full px-3 py-2 border rounded-md"
                rows={6}
                {...register("body", {
                  required: "Body is required",
                })}
              />
              {errors.body && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.body.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create"
                    : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default CreateTemplateModal;
