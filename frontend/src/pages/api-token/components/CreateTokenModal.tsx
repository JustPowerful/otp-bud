import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tokenApi } from "@/api/tokenApi";

interface CreateTokenModalProps {
  toggle: boolean;
  setToggle: (open: boolean) => void;
  onTokenCreated?: (token: string) => void;
}

interface CreateTokenFormData {
  expirationTime?: number;
}

const CreateTokenModal = ({
  toggle,
  setToggle,
  onTokenCreated,
}: CreateTokenModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTokenFormData>({
    defaultValues: {
      expirationTime: undefined,
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: CreateTokenFormData) => {
      const response = await tokenApi.createToken({
        expirationTime: data.expirationTime,
      });
      return response.data.token;
    },
    onSuccess: (token) => {
      onTokenCreated?.(token);
      reset();
      setToggle(false);
    },
    onError: (error) => {
      console.error("Failed to create token:", error);
    },
  });

  const onSubmit = (data: CreateTokenFormData) => {
    createTokenMutation.mutate(data);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    setToggle(open);
  };

  return (
    <Modal
      isOpen={toggle}
      onOpenChange={handleModalOpenChange}
      title="Create API Token"
      description="Create a new API token to authenticate your requests."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-namn-time">Expiration Time (days)</Label>
          <Input
            id="expiration-time"
            type="number"
            placeholder="e.g., 30"
            disabled={createTokenMutation.isPending}
            {...register("expirationTime", {
              min: {
                value: 1,
                message: "Expiration time must be at least 1 day",
              },
              valueAsNumber: true,
            })}
          />
          {errors.expirationTime && (
            <p className="text-sm text-destructive">
              {errors.expirationTime.message}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => handleModalOpenChange(false)}
            disabled={createTokenMutation.isPending}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createTokenMutation.isPending}>
            {createTokenMutation.isPending ? "Creating..." : "Create Token"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTokenModal;
