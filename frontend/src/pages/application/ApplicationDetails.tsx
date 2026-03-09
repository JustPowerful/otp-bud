import {
  applicationApi,
  type GetApplicationByIdResponse,
} from "@/api/applicationApi";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CreateApplicationModal from "./components/CreateApplicationModal";
import ConnectModal from "./components/ConnectModal";
import TemplateManagement from "./components/templates/TemplateManagement";

const ApplicationDetails = () => {
  // Application Details
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data, isLoading, refetch } = useQuery<GetApplicationByIdResponse>({
    queryKey: ["application", applicationId],
    queryFn: async () => {
      const response = await applicationApi.getApplicationById(
        applicationId || "",
      );
      return response.data;
    },
    enabled: !!applicationId,
  });

  return (
    <div className="p-4">
      {isLoading ? (
        <p>Loading application details...</p>
      ) : data ? (
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold mb-2">{data.data.name}</h1>
            <div className="flex items-center gap-2">
              <CreateApplicationModal
                mode="edit"
                applicationId={applicationId}
                onCreated={refetch}
              />
              <ConnectModal applicationId={applicationId} />
            </div>
          </div>
          <p className="text-sm text-zinc-500">{data.data.description}</p>
          <TemplateManagement applicationId={applicationId} />
        </div>
      ) : (
        <p className="text-muted-foreground">Application not found.</p>
      )}
    </div>
  );
};

export default ApplicationDetails;
