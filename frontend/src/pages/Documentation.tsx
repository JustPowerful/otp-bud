import { useState } from "react";
import "./Documentation.css";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const codeSnippets = [
    {
      title: "Send OTP Request",
      description:
        "Request an OTP to be sent to a user's email address. The OTP expires in 5 minutes.",
      command: `curl -X POST http://localhost:3000/api/v1/otp/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "applicationId": "your-app-id",
    "token": "your-token-key"
  }'`,
    },
    {
      title: "Validate OTP Request",
      description:
        "Verify that the OTP provided by the user is valid. After 5 failed attempts, the email/app combo is blocked for 15 minutes.",
      command: `curl -X POST http://localhost:3000/api/v1/otp/validate \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "applicationId": "your-app-id",
    "token": "your-token-key"
  }'`,
    },
  ];

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="documentation-container">
      <div className="documentation-wrapper">
        <h1>API Documentation</h1>
        <p className="intro-text">
          Learn how to use the OTP API with these example CURL commands.
        </p>

        <section className="api-requirements">
          <h2>Requirements</h2>
          <ul>
            <li>
              <strong>Email:</strong> Valid email address where the OTP will be
              sent
            </li>
            <li>
              <strong>Application ID:</strong> Your application identifier
            </li>
            <li>
              <strong>Token:</strong> Your API token key for authentication
            </li>
          </ul>
        </section>

        <section className="api-endpoints">
          {codeSnippets.map((snippet, index) => (
            <div key={index} className="endpoint-card">
              <h2>{snippet.title}</h2>
              <p className="endpoint-description">{snippet.description}</p>

              <div className="code-block-wrapper">
                <pre className="code-block">
                  <code>{snippet.command}</code>
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  variant="secondary"
                  onClick={() => handleCopy(index, snippet.command)}
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? "✓ Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="response-info">
          <h2>Response Format</h2>
          <p>All endpoints return a response with the following structure:</p>
          <div className="code-block-wrapper">
            <pre className="code-block">
              <code>{`{
  "message": "Success message",
  "data": {
    // Response specific data
  }
}`}</code>
            </pre>
          </div>
        </section>

        <section className="rate-limiting">
          <h2>Rate Limiting & Security</h2>
          <ul>
            <li>
              <strong>OTP Expiration:</strong> 5 minutes from generation
            </li>
            <li>
              <strong>Failed Attempts:</strong> Maximum 5 failed validation
              attempts
            </li>
            <li>
              <strong>Block Duration:</strong> 15 minutes after exceeding max
              attempts
            </li>
            <li>
              <strong>Reset:</strong> Failed attempts counter resets every 5
              minutes
            </li>
          </ul>
        </section>

        <section className="examples">
          <h2>Example Workflow</h2>
          <ol>
            <li>
              <strong>Step 1:</strong> Send OTP - User requests an OTP for their
              email
            </li>
            <li>
              <strong>Step 2:</strong> User receives email - OTP is delivered to
              their inbox
            </li>
            <li>
              <strong>Step 3:</strong> Validate OTP - User submits the OTP code
              for verification
            </li>
            <li>
              <strong>Step 4:</strong> Access granted - On successful
              validation, proceed with your application logic
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
