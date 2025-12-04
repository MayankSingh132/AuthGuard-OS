import { PageHeader } from "@/components/page-header";
import { CodeBlock } from "@/components/code-block";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const firestoreRules = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is an admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users can only read/write their own data.
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }

    // Auth logs can only be created by authenticated users.
    // Admins can read all logs for auditing. No updates or deletes allowed.
    match /auth_logs/{logId} {
      allow create: if request.auth.uid != null;
      allow read: if isAdmin();
      allow update, delete: if false; // Logs are immutable
    }

    // Security policies are read-only for all authenticated users.
    // Only admins can modify security policies.
    match /security_policies/{policyId} {
      allow read: if request.auth.uid != null;
      allow write: if isAdmin();
    }
  }
}
`;

export default function SecurityRulesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Firebase Security Rules"
        description="Rules to protect data in Firestore, ensuring users can only access what they're permitted to."
      />
      <Card>
        <CardHeader>
          <CardTitle>Firestore Rules</CardTitle>
          <CardDescription>
            These rules enforce role-based access control, immutability for logs, and secure handling of user data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={firestoreRules} lang="rules" />
        </CardContent>
      </Card>
    </div>
  );
}
