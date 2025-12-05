
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const threats = [
  {
    threat: "Credential Stuffing & Brute-Force",
    description: "Attackers use stolen credentials from other breaches or automated scripts to guess passwords and gain unauthorized access.",
    mitigation: "Firebase Authentication has built-in protection against this. Additionally, we track 'failedAttempts' in user documents to implement custom account lockout policies via Cloud Functions.",
  },
  {
    threat: "Session Hijacking",
    description: "An attacker steals a user's valid session cookie or token to impersonate them without needing credentials.",
    mitigation: "We use short-lived ID tokens (refreshed automatically and securely by the Firebase SDK) and enforce HTTPS across the entire application. Custom session tokens can be revoked on the server-side if a compromise is suspected.",
  },
  {
    threat: "Insecure Direct Object Reference (IDOR)",
    description: "A user manipulates an identifier (e.g., a URL parameter) to access data belonging to another user.",
    mitigation: "Our Firestore Security Rules are the primary defense. Rules like 'allow read, update: if request.auth.uid == userId;' ensure that a user can only ever access documents that match their own authenticated UID.",
  },
  {
    threat: "Data Eavesdropping",
    description: "An attacker intercepts network traffic to read sensitive data like passwords or personally identifiable information (PII).",
    mitigation: "All communication between the client and Firebase services is automatically encrypted using Transport Layer Security (TLS). There is no unencrypted traffic.",
  },
  {
    threat: "Cross-Site Scripting (XSS)",
    description: "An attacker injects malicious scripts into the web page, which then execute in the browsers of other users.",
    mitigation: "React and Next.js provide automatic output encoding for content rendered in JSX, which prevents script injection. All user-generated content should be properly sanitized if it is ever rendered as raw HTML.",
  },
  {
    threat: "Denial of Service (DoS) on Cloud Functions",
    description: "An attacker floods a callable Cloud Function with requests, causing it to scale excessively and incur high costs.",
    mitigation: "Firebase provides App Check, which can be configured to ensure that requests to Cloud Functions only come from your legitimate application, blocking unauthorized clients and scripts.",
  },
];

export default function ThreatModelPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Threat Model & Mitigation"
        description="An analysis of potential security vulnerabilities and the strategies in place to counter them."
      />
      <Card>
        <CardHeader>
            <CardTitle>Common Vulnerabilities</CardTitle>
            <CardDescription>A breakdown of threats and the corresponding defense mechanisms built into AuthGuard OS.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Threat</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mitigation Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threats.map((item) => (
                <TableRow key={item.threat}>
                  <TableCell className="font-semibold">{item.threat}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell>{item.mitigation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
