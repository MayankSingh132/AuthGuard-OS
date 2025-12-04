import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const threats = [
  {
    threat: "Buffer Overflow Attacks",
    description: "An attacker sends an oversized payload to an input field, hoping to overwrite adjacent memory and execute arbitrary code.",
    mitigation: "All inputs are validated for size on the backend (Cloud Functions) before processing. Payloads exceeding a safe threshold (e.g., 1KB) are immediately rejected. The 'detectOverflowPayload()' function demonstrates this.",
  },
  {
    threat: "Trapdoors / Backdoors",
    description: "Hidden entry points or malicious commands embedded in input strings that bypass normal authentication.",
    mitigation: "Inputs are sanitized and scanned for known malicious patterns (e.g., SQL keywords, shell commands). The 'detectTrapdoor()' function provides a basic string-matching defense layer.",
  },
  {
    threat: "Brute-Force Login Attempts",
    description: "An attacker repeatedly tries different passwords for a known username.",
    mitigation: "Implement rate-limiting on login attempts. After a set number of consecutive failures (e.g., 5), the account is temporarily locked. This is tracked by the 'failedAttempts' field in the 'users' collection.",
  },
  {
    threat: "Session Hijacking",
    description: "An attacker steals a user's valid session token to gain unauthorized access.",
    mitigation: "Use short-lived custom authentication tokens. Enforce HTTPS for all communication. Bind session tokens to the client's IP address where possible.",
  },
  {
    threat: "Token Replay Attacks",
    description: "An attacker intercepts a token and reuses it to authenticate as the user.",
    mitigation: "Implement nonce (number used once) mechanisms. Timestamps within tokens ensure they are only valid for a short period. Once a token is used or expired, it is rejected.",
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
