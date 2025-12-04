import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, KeyRound, Mail, ShieldCheck, Smartphone, LogIn, ExternalLink } from "lucide-react";

const mfaSteps = [
  {
    icon: <LogIn className="h-6 w-6 text-primary" />,
    title: "Step 1: Initial Login Request",
    description: "The user provides their primary credentials (e.g., email and password) to the OS login manager. The OS module calls the 'verifyCredentials()' API.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "Step 2: Primary Verification & MFA Check",
    description: "Firebase verifies the primary credentials. The backend then checks the user's profile in Firestore to see if MFA is enabled ('mfaEnabled: true').",
  },
  {
    icon: <ExternalLink className="h-6 w-6 text-primary" />,
    title: "Step 3: Initiate MFA",
    description: "If MFA is required, the backend calls 'initiateMFA()'. This triggers the sending of a second factor, such as an OTP to a phone, a link to an email, or a challenge to a device key.",
  },
  {
    icon: <KeyRound className="h-6 w-6 text-primary" />,
    title: "Step 4: User Provides Second Factor",
    description: "The user enters the OTP, clicks the verification link, or uses their device key. The OS module sends this information to the backend via the 'validateToken()' API.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
    title: "Step 5: Token Issuance & Session Creation",
    description: "The backend validates the second factor. Upon success, it generates a short-lived custom authentication token and returns it to the OS module, granting the user access.",
  },
];

export default function MfaFlowPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Factor Authentication (MFA) Flow"
        description="The end-to-end process for verifying a user with a second security factor."
      />

      <div className="relative flex flex-col items-center gap-8 lg:gap-0 lg:flex-row lg:justify-between">
        {mfaSteps.map((step, index) => (
          <>
            <Card key={step.title} className="w-full max-w-sm lg:max-w-xs z-10 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">{step.icon}</div>
                  <CardTitle>{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </CardContent>
            </Card>
            {index < mfaSteps.length - 1 && (
              <ArrowRight className="h-8 w-8 text-muted-foreground absolute top-1/2 -translate-y-1/2 transform rotate-90 lg:rotate-0 lg:relative" />
            )}
          </>
        ))}
         <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2 lg:hidden" />
         <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden lg:block" />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Token & Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p><span className="font-semibold text-foreground">Token Expiry:</span> Custom authentication tokens are intentionally short-lived (e.g., 1 hour) to minimize the risk of session hijacking. The OS integration module is responsible for securely storing this token in memory.</p>
            <p><span className="font-semibold text-foreground">Session Renewal:</span> Before the token expires, the client-side SDK should use its refresh token (managed automatically by the Firebase client SDKs) to silently obtain a new ID token without requiring the user to log in again. This ensures a seamless user experience while maintaining security.</p>
            <p><span className="font-semibold text-foreground">Logout:</span> When a user logs out, the OS module must explicitly call the sign-out method from the Firebase SDK. This invalidates the current session and clears any stored tokens, preventing unauthorized access.</p>
        </CardContent>
      </Card>
    </div>
  );
}
