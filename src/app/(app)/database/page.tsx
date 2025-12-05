
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const usersFields = [
  { field: "email", type: "string", desc: "User's primary email address." },
  { field: "mfaEnabled", type: "boolean", desc: "Flag indicating if MFA is active for the user." },
  { field: "mfaType", type: "string", desc: "'otp', 'email', or 'device_key'." },
  { field: "deviceKeys", type: "array[string]", desc: "List of registered device public keys." },
  { field: "lastLogin", type: "timestamp", desc: "Timestamp of the last successful login." },
  { field: "failedAttempts", type: "number", desc: "Count of consecutive failed login attempts." },
];

const authLogsFields = [
    { field: "userId", type: "string", desc: "Reference to the user attempting to log in." },
    { field: "timestamp", type: "timestamp", desc: "Time of the authentication event." },
    { field: "methodUsed", type: "string", desc: "e.g., 'password_otp', 'device_key'." },
    { field: "ip", type: "string", desc: "IP address of the client." },
    { field: "status", type: "string", desc: "'success', 'failure', or 'threat_detected'." },
    { field: "threatDetected", type: "boolean", desc: "Indicates if a threat was detected during the event." },
];

const securityPoliciesFields = [
    { field: "rule", type: "string", desc: "Identifier for the security rule, e.g., 'RATE_LIMIT_LOGIN'." },
    { field: "severity", type: "string", desc: "'low', 'medium', 'high', 'critical'." },
    { field: "value", type: "any", desc: "Configuration value for the rule, e.g., 5 for max failed attempts." },
    { field: "description", type: "string", desc: "Explanation of the policy rule." },
];

const SchemaTable = ({ data }: { data: { field: string, type: string, desc: string }[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[180px]">Field</TableHead>
                <TableHead className="w-[180px]">Type</TableHead>
                <TableHead>Description</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map((item) => (
                <TableRow key={item.field}>
                    <TableCell className="font-mono text-xs">{item.field}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.type}</TableCell>
                    <TableCell>{item.desc}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)


export default function DatabasePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Database Schema"
        description="The structure of data stored in Firestore, organized into collections for users, logs, and policies."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>users/{'{userId}'}</CardTitle>
            <CardDescription>
              Stores user-specific information, including authentication details and MFA configuration. The user's password is not stored here; it is managed by Firebase Authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchemaTable data={usersFields} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>auth_logs/{'{logId}'}</CardTitle>
            <CardDescription>
              A comprehensive and immutable log of all authentication attempts, successful or otherwise, for auditing and security analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <SchemaTable data={authLogsFields} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>security_policies/{'{policyId}'}</CardTitle>
            <CardDescription>
              Defines system-wide security rules and configurations, such as rate limiting and MFA enforcement. These are typically managed by administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchemaTable data={securityPoliciesFields} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
