
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, KeyRound, ShieldCheck, LogIn, ExternalLink } from "lucide-react";

const mfaSteps = [
  {
    icon: <LogIn className="h-6 w-6 text-primary" />,
    title: "Step 1: Initial Login",
    description: "The user provides their primary credentials (e.g., email and password) to the OS login manager. The client authenticates with Firebase Auth.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "Step 2: MFA Check",
    description: "The client sends the user's ID token to a secure Cloud Function. The function checks the user's profile in Firestore for 'mfaEnabled: true'.",
  },
  {
    icon: <ExternalLink className="h-6 w-6 text-primary" />,
    title: "Step 3: Initiate MFA Factor",
    description: "If MFA is required, the backend triggers the appropriate MFA flow, such as sending an OTP to the user's phone or a magic link to their email.",
  },
  {
    icon: <KeyRound className="h-6 w-6 text-primary" />,
    title: "Step 4: User Verifies",
    description: "The user enters the received OTP or clicks the verification link. The client sends this second factor to a validation function on the backend.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
    title: "Step 5: Session Established",
    description: "The backend validates the second factor. On success, it generates a short-lived custom session token and returns it to the client, granting access.",
  },
];

export default function MfaFlowPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Factor Authentication (MFA) Flow"
        description="The end-to-end process for verifying a user with a second security factor."
      />

      <div className="relative">
        <div className="absolute left-1/2 top-4 h-full w-px bg-border -translate-x-1/2 lg:hidden" />
        <div className="absolute top-1/2 left-4 w-full h-px bg-border -translate-y-1/2 hidden lg:flex" />

        <div className="relative flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
          {mfaSteps.map((step, index) => (
            <div key={step.title} className="relative z-10 flex w-full max-w-sm lg:max-w-xs items-start gap-4 lg:flex-col lg:items-center lg:gap-2">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">{step.icon}</div>
                <div className="lg:text-center">
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
                </div>
                {index < mfaSteps.length - 1 && (
                  <ArrowRight className="h-8 w-8 text-muted-foreground absolute top-1/2 right-full mr-4 -translate-y-1/2 transform rotate-90 lg:rotate-0 lg:relative lg:right-auto lg:left-full lg:top-auto lg:bottom-1/2 lg:ml-4 lg:translate-y-8" />
                )}
            </div>
          ))}
        </div>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Token & Session Management</CardTitle>
          <CardDescription>How tokens are used to maintain a secure and seamless user session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <p><span className="font-semibold text-foreground">ID Tokens (Client-Side):</span> After a standard login, the Firebase client SDK provides an ID Token. This token proves the user's identity to your backend but should not be used for long-term session management. It has a short lifetime (typically 1 hour).</p>
            <p><span className="font-semibold text-foreground">Custom Session Tokens (Server-Side):</span> After your backend verifies the user (and any MFA factors), it generates a custom, potentially longer-lived session token. This token is what the OS module should store and use for subsequent authenticated requests.</p>
            <p><span className="font-semibold text-foreground">Session Renewal:</span> The Firebase client SDK automatically handles the refreshing of ID tokens in the background using a long-lived refresh token. This process is seamless to the user. The custom session token, however, must be managed by your application logic.</p>
            <p><span className="font-semibold text-foreground">Secure Logout:</span> When a user logs out, the client must call the Firebase SDK's sign-out method. On the backend, you should also implement a mechanism to invalidate the custom session token (e.g., by maintaining a denylist of revoked tokens) to prevent replay attacks.</p>
        </CardContent>
      </Card>
    </div>
  );
}
