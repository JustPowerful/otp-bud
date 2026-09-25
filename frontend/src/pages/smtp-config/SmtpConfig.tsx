import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import {
  smtpApi,
  type SmtpConfigData,
  type AddSmtpConfigRequest,
  type UpdateSmtpConfigRequest,
} from "@/api/smtpApi";
import "./SmtpConfig.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormData {
  smtpService: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
}

const SmtpConfig = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    smtpService: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
  });

  // Fetch all SMTP configurations
  const { data: configsResponse, isLoading } = useQuery({
    queryKey: ["smtpConfigs"],
    queryFn: () => smtpApi.getAllSmtpConfigs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const configs = configsResponse?.data || [];

  // Mutation for adding new SMTP config
  const addMutation = useMutation({
    mutationFn: (data: AddSmtpConfigRequest) => smtpApi.addSmtpConfig(data),
    onSuccess: () => {
      setSuccess("SMTP configuration added successfully");
      queryClient.invalidateQueries({ queryKey: ["smtpConfigs"] });
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add SMTP configuration";
      setError(errorMessage);
    },
  });

  // Mutation for updating SMTP config
  const updateMutation = useMutation({
    mutationFn: (data: { smtpId: string; config: UpdateSmtpConfigRequest }) =>
      smtpApi.updateSmtpConfig(data.smtpId, data.config),
    onSuccess: () => {
      setSuccess("SMTP configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["smtpConfigs"] });
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update SMTP configuration";
      setError(errorMessage);
    },
  });

  // Mutation for deleting SMTP config
  const deleteMutation = useMutation({
    mutationFn: (smtpId: string) => smtpApi.deleteSmtpConfig(smtpId),
    onSuccess: () => {
      setSuccess("SMTP configuration deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["smtpConfigs"] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete SMTP configuration";
      setError(errorMessage);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      smtpService: "",
      smtpPort: "",
      smtpUser: "",
      smtpPassword: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.smtpService ||
      !formData.smtpPort ||
      !formData.smtpUser ||
      !formData.smtpPassword
    ) {
      setError("All fields are required");
      return;
    }

    setError(null);

    if (editingId) {
      // Update existing config
      updateMutation.mutate({
        smtpId: editingId,
        config: formData,
      });
    } else {
      // Add new config
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (config: SmtpConfigData) => {
    setFormData({
      smtpService: config.smtpService,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpPassword: config.smtpPassword,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this configuration?"))
      return;

    setError(null);
    deleteMutation.mutate(id);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="smtp-config-container">
      <div className="smtp-config-wrapper">
        {/* Header */}
        <div className="smtp-header">
          <div>
            <h1>SMTP Configuration</h1>
            <p className="smtp-subtitle">
              Manage your email service configurations
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            Add Configuration
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)}>×</button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form className="smtp-form" onSubmit={handleSubmit}>
            <h2>
              {editingId ? "Edit Configuration" : "Add New Configuration"}
            </h2>

            <div className="form-group">
              <label htmlFor="smtpService">SMTP Service URL *</label>
              <Input
                type="text"
                id="smtpService"
                name="smtpService"
                placeholder="e.g., smtp.gmail.com"
                value={formData.smtpService}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="smtpPort">SMTP Port *</label>
                <Input
                  type="text"
                  id="smtpPort"
                  name="smtpPort"
                  placeholder="e.g., 587"
                  value={formData.smtpPort}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="smtpUser">Email Address *</label>
                <Input
                  type="email"
                  id="smtpUser"
                  name="smtpUser"
                  placeholder="e.g., your-email@gmail.com"
                  value={formData.smtpUser}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="smtpPassword">SMTP Password *</label>
              <Input
                type="password"
                id="smtpPassword"
                name="smtpPassword"
                placeholder="Enter your SMTP password"
                value={formData.smtpPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {editingId ? "Update" : "Add"} Configuration
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                type="button"
                onClick={resetForm}
              >
                <X size={18} />
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <Loader size={40} className="spinner" />
            <p>Loading configurations...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && configs.length === 0 && (
          <div className="empty-state">
            <p>No SMTP configurations yet</p>
            <p className="empty-subtitle">
              Create your first configuration to get started
            </p>
          </div>
        )}

        {/* Configurations List */}
        {!isLoading && configs.length > 0 && (
          <div className="configs-grid">
            {configs.map((config) => (
              <div key={config.id} className="config-card">
                <div className="config-header">
                  <h3>{config.smtpService}</h3>
                  <div className="config-actions">
                    <button
                      className="action-button edit"
                      onClick={() => handleEdit(config)}
                      title="Edit"
                      disabled={deleteMutation.isPending}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDelete(config.id)}
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader size={16} className="spinner" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="config-details">
                  <div className="detail-item">
                    <span className="label">Port:</span>
                    <span className="value">{config.smtpPort}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{config.smtpUser}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Password:</span>
                    <div className="password-display">
                      <span className="value">
                        {showPassword[config.id]
                          ? config.smtpPassword
                          : "•".repeat(config.smtpPassword.length)}
                      </span>
                      <button
                        className="toggle-password"
                        onClick={() => togglePasswordVisibility(config.id)}
                        title="Toggle password visibility"
                      >
                        {showPassword[config.id] ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmtpConfig;
