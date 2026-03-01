import { Button } from "@/components/ui/button";

const ApiTokenManagement = () => {
  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">API Token Management</h1>
        <Button className="mb-4">Create a new API token</Button>
      </div>

      <div className="bg-white shadow rounded-lg p-4 flex items-center justify-center">
        <div className="flex flex-col justify-center">
          <p className="text-sm text-muted-foreground mb-2">
            You currently have no API tokens. Create a new token to get started.
          </p>
          <Button>Create your first API token</Button>
        </div>
      </div>
    </div>
  );
};

export default ApiTokenManagement;
