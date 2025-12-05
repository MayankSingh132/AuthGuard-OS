
import { PageHeader } from "@/components/page-header";
import { CodeBlock } from "@/components/code-block";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const firestoreRules = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    //--------------------------------------------------------------------
    // Helper Functions
    //--------------------------------------------------------------------

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    //--------------------------------------------------------------------
    // Collection: users
    //--------------------------------------------------------------------
    match /users/{userId} {
      // ANY authenticated user can list the users for the dashboard.
      allow list: if isSignedIn();

      // ONLY the document owner can read their own full document.
      allow get: if isOwner(userId);
      
      // A new user can create their own user document.
      allow create: if isOwner(userId);

      // The owner can update their own document.
      allow update: if isOwner(userId);

      // The owner can delete their own account.
      allow delete: if isOwner(userId);
    }

    //--------------------------------------------------------------------
    // Collection: auth_logs
    //--------------------------------------------------------------------
    match /auth_logs/{logId} {
      // Logs are immutable. No updates or deletes.
      allow update, delete: if false;

      // ANY authenticated user can create a new log entry. This is
      // useful for logging events from different services.
      allow create: if isSignedIn();

      // ANY authenticated user can read the list of logs for the dashboard.
      allow list: if isSignedIn();
      allow get: if isSignedIn();
    }

    //--------------------------------------------------------------------
    // Collection: security_policies
    //--------------------------------------------------------------------
    match /security_policies/{policyId} {
      // Policies are read-only for all clients to ensure integrity.
      // They should only be modified from a trusted server environment
      // or the Firebase Console.
      allow write: if false;

      // Any authenticated user can read security policies.
      allow read: if isSignedIn();
    }
  }
}
`;

export default function SecurityRulesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Firestore Security Rules"
        description="The rules that protect your data in Firestore, ensuring users can only access what they're permitted to."
      />
      <Card>
        <CardHeader>
          <CardTitle>AuthGuard OS Ruleset</CardTitle>
          <CardDescription>
            This ruleset enforces a user-ownership model, allows reads for dashboard displays, and protects sensitive collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={firestoreRules} lang="rules" />
        </CardContent>
      </Card>
    </div>
  );
}
