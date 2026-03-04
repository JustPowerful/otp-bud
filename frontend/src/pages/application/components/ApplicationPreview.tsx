import type { Application } from "@/api/applicationApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DeleteApplicationModal from "./DeleteApplicationModal";
import CreateApplicationModal from "./CreateApplicationModal";

const ApplicationPreview = ({
  application,
  refetch,
}: {
  application: Application;
  refetch: () => void;
}) => {
  return (
    <Card key={application.id}>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold uppercase">
          {application.name?.[0] || "A"}
        </div>
        <div className="min-w-0">
          <CardTitle className="text-base truncate">
            {application.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {application.description || "No description has been provided."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <DeleteApplicationModal
          applicationId={application.id}
          onDeleted={refetch}
        />
        <CreateApplicationModal
          mode="edit"
          applicationId={application.id}
          onCreated={refetch}
        />
      </CardContent>
    </Card>
  );
};

export default ApplicationPreview;
