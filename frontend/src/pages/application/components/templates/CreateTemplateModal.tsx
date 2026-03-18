import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  templateApi,
  type CreateTemplateRequest,
  type GetTemplateDetailsResponse,
  type UpdateTemplateRequest,
} from "@/api/templateApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ReactDOM from "react-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type ReactDomWithFindType = typeof ReactDOM & {
  findDOMNode?: (component: Element | null | undefined) => Element | null;
};

const reactDomWithFind = ReactDOM as ReactDomWithFindType;
if (!reactDomWithFind.findDOMNode) {
  reactDomWithFind.findDOMNode = (component: Element | null | undefined) => {
    if (!component) return null;
    if (component instanceof Element) {
      return component;
    }
    if (typeof component === "object" && "current" in component) {
      return (component as { current: Element | null }).current;
    }
    return null;
  };
}

type CreateTemplateModalProps = {
  applicationId?: string;
  templateId?: string;
  mode?: "create" | "edit";
  onCreated?: () => void;
  triggerLabel?: string;
};

const quillToolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["image"],
  ["link"],
  ["clean"],
];

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "image",
];

const CreateTemplateModal = ({
  applicationId,
  templateId,
  mode = "create",
  onCreated,
  triggerLabel,
}: CreateTemplateModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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

  const quillRef = useRef<ReactQuill | null>(null);
  const bodyValue = watch("body");

  const placeholders = useMemo(
    () => [
      {
        key: "{{otp}}",
        label: "OTP code",
        sample: "123456",
      },
      {
        key: "{{appname}}",
        label: "Application name",
        sample: "My App",
      },
      {
        key: "{{expiry}}",
        label: "Expiry time",
        sample: "12:34 PM",
      },
      {
        key: "{{email}}",
        label: "Recipient email",
        sample: "user@example.com",
      },
    ],
    [],
  );

  const handleInsertPlaceholder = (placeholder: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      setValue("body", `${bodyValue || ""}${placeholder}`, {
        shouldDirty: true,
      });
      return;
    }

    const range = editor.getSelection(true);
    const insertIndex = range?.index ?? editor.getLength();
    const selectionLength = range?.length ?? 0;
    if (selectionLength > 0) {
      editor.deleteText(insertIndex, selectionLength);
    }
    editor.insertText(insertIndex, placeholder, "user");
    editor.setSelection(insertIndex + placeholder.length, 0);
    setValue("body", editor.root.innerHTML, {
      shouldDirty: true,
    });
    editor.focus();
  };

  const handleCopyPlaceholder = async (placeholder: string) => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(placeholder);
    } catch {
      // Ignore clipboard errors to avoid blocking UI.
    }
  };

  const handleInsertImage = useCallback(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const imageUrl = window.prompt("Enter image URL");
    if (!imageUrl) return;
    const range = editor.getSelection(true);
    const insertIndex = range?.index ?? editor.getLength();
    editor.insertEmbed(insertIndex, "image", imageUrl, "user");
    editor.setSelection(insertIndex + 1, 0);
    setValue("body", editor.root.innerHTML, { shouldDirty: true });
    editor.focus();
  }, [setValue]);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: quillToolbarOptions,
        handlers: {
          image: handleInsertImage,
        },
      },
    }),
    [handleInsertImage],
  );

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
              <Controller
                control={control}
                name="body"
                rules={{ required: "Body is required" }}
                render={({ field }) => (
                  <ReactQuill
                    ref={(element) => {
                      quillRef.current = element;
                    }}
                    value={field.value || ""}
                    onChange={(value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Hi {{name}}, your OTP code is {{code}}"
                    theme="snow"
                    className="min-h-37.5 bg-white"
                  />
                )}
              />
              {errors.body && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.body.message}
                </p>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="text-sm font-medium">Available placeholders</div>
              <div className="flex flex-wrap gap-2">
                {placeholders.map((placeholder) => (
                  <div
                    key={placeholder.key}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => handleInsertPlaceholder(placeholder.key)}
                      className="font-mono text-slate-900 hover:text-slate-700"
                    >
                      {placeholder.key}
                    </button>
                    <span className="text-xs text-slate-500">
                      {placeholder.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPlaceholder(placeholder.key)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                Click a placeholder to insert it at the cursor.
              </div>
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
