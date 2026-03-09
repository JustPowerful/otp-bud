import { Link } from "react-router-dom";
import { ArrowRight, Code2, Key, LayoutGrid, Mail, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
          <Zap className="mr-2 h-4 w-4" />
          <span>Lightning fast OTP delivery</span>
        </div>
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          The simplest <span className="text-primary">OTP API</span> for
          developers
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Generate, send, and verify one-time passwords via email instantly.
          Create custom email templates, manage multiple apps, and integrate
          with a few lines of code.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {isAuthenticated ? (
            <Link to="/applications">
              <Button size="lg" className="h-12 px-8 text-base gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 text-base gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Code Example Section */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Ready in seconds, not days
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                You shouldn't have to build complex email flows, template
                builders, or key management. OTP Bud handles the heavy lifting
                so you can focus on building your app.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: Mail,
                    label: "Beautiful dynamic email templates out of the box",
                  },
                  {
                    icon: LayoutGrid,
                    label: "Manage multiple staging/production apps easily",
                  },
                  {
                    icon: Key,
                    label: "Secure token generation without the hassle",
                  },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-slate-700 font-medium">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-left shadow-2xl overflow-hidden border border-slate-800">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <pre className="text-sm font-mono leading-relaxed">
                <span className="text-pink-400">curl</span> -X POST{" "}
                <span className="text-blue-300">
                  "https://api.otpbud.com/api/v1/otp/send"
                </span>{" "}
                \ <br />
                {"  "} -H{" "}
                <span className="text-green-300">
                  "Authorization: your_api_key_here"
                </span>{" "}
                \ <br />
                {"  "} -H{" "}
                <span className="text-green-300">
                  "Content-Type: application/json"
                </span>{" "}
                \ <br />
                {"  "} -d <span className="text-yellow-300">'{"{"}'</span>
                <br />
                {'       "applicationId": "app_clk201",'} <br />
                {'       "email": "user@example.com"'} <br />
                {"     "} <span className="text-yellow-300">{"}'"}</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 sm:py-32">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Everything you need for seamless auth
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            We abstract away the messiness of OTP verification emails.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Custom Templates",
              description:
                "Use our built-in UI to craft stunning email templates using variables like {{otp}} and {{expiry}}.",
              icon: Mail,
            },
            {
              title: "Multi-Apps",
              description:
                "Build once, use everywhere. Group your API traffic, templates, and analytics by logic application.",
              icon: LayoutGrid,
            },
            {
              title: "Developer API keys",
              description:
                "Generate and securely revoke API tokens. Total control over who accesses your OTP endpoint.",
              icon: Key,
            },
            {
              title: "No-bloat integration",
              description:
                "A single REST endpoint to handle the entire OTP email flow.",
              icon: Code2,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center md:order-2 space-x-6 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              &copy; {new Date().getFullYear()} OTP Bud. All rights reserved.
            </span>
          </div>
          <div className="mt-4 flex justify-center text-sm font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent md:order-1 md:mt-0">
            OTP Bud SaaS
          </div>
        </div>
      </footer>
    </div>
  );
}
