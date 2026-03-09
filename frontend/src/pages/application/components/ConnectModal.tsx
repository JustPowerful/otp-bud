import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConnectModalProps = {
  applicationId?: string;
};

const ConnectModal = ({ applicationId }: ConnectModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<
    "send" | "validate" | null
  >(null);

  const apiBase =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  const sendSnippet = useMemo(() => {
    const id = applicationId || "<application_id>";
    return [
      "curl -X POST \\",
      `  "${apiBase}/otp/send" \\`,
      '  -H "Content-Type: application/json" \\',
      "  -d '{",
      `    "applicationId": "${id}",`,
      '    "email": "user@example.com",',
      '    "token": "<token>"',
      "  }'",
    ].join("\n");
  }, [apiBase, applicationId]);

  const validateSnippet = useMemo(() => {
    const id = applicationId || "<application_id>";
    return [
      "curl -X POST \\",
      `  "${apiBase}/otp/validate" \\`,
      '  -H "Content-Type: application/json" \\',
      "  -d '{",
      `    "applicationId": "${id}",`,
      '    "email": "user@example.com",',
      '    "otp": "<otp_code>",',
      '    "token": "<token>"',
      "  }'",
    ].join("\n");
  }, [apiBase, applicationId]);

  const handleCopy = async (snippetKey: "send" | "validate") => {
    const snippet = snippetKey === "send" ? sendSnippet : validateSnippet;
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(snippetKey);
      window.setTimeout(
        () =>
          setCopiedSnippet((current) =>
            current === snippetKey ? null : current,
          ),
        1200,
      );
    } catch {
      // Ignore clipboard errors to avoid blocking UI.
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Connect
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Connect your app"
        description="Use your API key to call the OTP endpoint. Replace the <token> placeholder with an API key generated from the tokens page."
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            <div className="font-medium text-slate-900 mb-1">
              1. Get your API key
            </div>
            <div>
              Generate a key from the{" "}
              <Link to="/api-keys" className="text-primary underline">
                API Keys
              </Link>{" "}
              page, then include it in the request payload as the token field.
            </div>
          </div>

          <div className="text-sm text-slate-600">
            <div className="font-medium text-slate-900 mb-1">
              2. Call the send endpoint
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <span className="text-xs text-slate-500">curl</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopy("send")}
                >
                  {copiedSnippet === "send" ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="overflow-x-auto p-3 text-xs text-slate-800">
                <code>{sendSnippet}</code>
              </pre>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            <div className="font-medium text-slate-900 mb-1">
              3. Validate the issued OTP
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <span className="text-xs text-slate-500">curl</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopy("validate")}
                >
                  {copiedSnippet === "validate" ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="overflow-x-auto p-3 text-xs text-slate-800">
                <code>{validateSnippet}</code>
              </pre>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            The token must be sent without a Bearer prefix.
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConnectModal;
