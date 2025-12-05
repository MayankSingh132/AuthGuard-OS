
import { PageHeader } from "@/components/page-header";
import { CodeBlock } from "@/components/code-block";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const functions = [
  {
    name: "registerUser",
    description: "Registers a new user in Firebase Authentication and initializes their data in Firestore.",
    input: "email, password",
    output: "User UID or error.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Ensure admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const registerUser = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  if (!email || !password || password.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'A valid email and a password of at least 6 characters are required.');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    
    // Initialize user data in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      mfaEnabled: false,
      failedAttempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
    });

    return { uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new functions.https.HttpsError('internal', 'An internal error occurred while creating the user.');
  }
});
    `,
  },
  {
    name: "verifyCredentials",
    description: "Verifies user credentials on the client, checks MFA status, and returns a custom token if successful.",
    input: "ID Token from client",
    output: "Success status, MFA requirement, or custom session token.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// This is a conceptual example. The client signs in with email/password, 
// gets an ID token, and sends that token to a function like this for verification.
export const verifyUserAndGetSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = context.auth.uid;
  const userDocRef = admin.firestore().collection('users').doc(uid);
  const userDoc = await userDocRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User data could not be found.');
  }

  const userData = userDoc.data();
  // Reset failed login attempts upon successful primary auth
  await userDocRef.update({ failedAttempts: 0, lastLogin: admin.firestore.FieldValue.serverTimestamp() });

  if (userData.mfaEnabled) {
    // In a real scenario, you would trigger the specific MFA flow (e.g., send OTP)
    // and wait for a second function call to validate it.
    return { status: 'mfa_required', mfaType: userData.mfaType };
  }

  // If no MFA is needed, create a custom session token directly.
  const customToken = await admin.auth().createCustomToken(uid);
  return { status: 'success', token: customToken };
});
    `,
  },
  {
    name: "sendOTP",
    description: "Generates and sends a One-Time Password (OTP) to the user's registered device or email.",
    input: "userId",
    output: "Success or error message.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Assume a third-party service for sending messages, like Twilio

export const sendOtp = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
  }
  
  const userId = context.auth.uid;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + (10 * 60 * 1000); // 10-minute expiry

  // Save the hashed OTP and expiry to the user's document
  await admin.firestore().collection('users').doc(userId).update({
    otp: otp, // In production, you MUST hash the OTP
    otpExpiry: expiry
  });

  // Example: Send OTP via a messaging service (implementation details omitted)
  // await twilio.messages.create({ to: userPhoneNumber, from: '...', body: \`Your code is \${otp}\` });
  
  return { status: 'OTP has been sent.' };
});
    `,
  },
  {
    name: "validateOTP",
    description: "Validates a One-Time Password (OTP) provided by the user and issues a session token on success.",
    input: "userId, otp",
    output: "Custom auth token or error.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const validateOtp = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
  }
  
  const userId = context.auth.uid;
  const { otp } = data;
  
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found.');
  }

  const userData = userDoc.data();
  // In production, compare against a hashed OTP
  if (userData.otp !== otp || userData.otpExpiry < Date.now()) {
    await userRef.update({ failedAttempts: admin.firestore.FieldValue.increment(1) });
    throw new functions.https.HttpsError('invalid-argument', 'The OTP is invalid or has expired.');
  }

  // Clear the OTP and generate the final custom session token
  await userRef.update({ otp: null, otpExpiry: null });
  const customToken = await admin.auth().createCustomToken(userId);
  
  return { status: 'success', token: customToken };
});
    `,
  },
  {
    name: "detectOverflow",
    description: "A utility function to detect potential buffer overflow attacks by checking the size of an input payload.",
    input: "payload (string)",
    output: "Boolean indicating if an overflow is suspected.",
    code: `
const MAX_PAYLOAD_SIZE_BYTES = 4096; // 4KB as a safe limit for typical inputs

/**
 * Checks if a string payload exceeds a maximum byte length.
 * @param {string} payload The string to inspect.
 * @returns {boolean} True if the payload is too large, false otherwise.
 */
export function detectOverflowPayload(payload: string): boolean {
  if (typeof payload !== 'string') {
    return false;
  }
  
  // Use TextEncoder to get the actual byte length of the string, accounting for multi-byte characters.
  const byteLength = new TextEncoder().encode(payload).length;
  
  if (byteLength > MAX_PAYLOAD_SIZE_BYTES) {
    console.warn(\`Potential overflow detected. Payload size (\${byteLength} bytes) exceeds the limit of \${MAX_PAYLOAD_SIZE_BYTES} bytes.\`);
    return true;
  }

  return false;
}
    `,
  },
  {
    name: "detectTrapdoor",
    description: "Scans an input string for common trapdoor or backdoor signatures to prevent command injection.",
    input: "inputString (string)",
    output: "Boolean indicating if a trapdoor pattern is suspected.",
    code: `
// A list of Regex patterns to detect common injection/trapdoor attempts.
const trapdoorPatterns = [
  /\\b(exec|shell_exec|system|passthru|eval)\\b/i,          // Command execution
  /\\b(SELECT\\s+.+\\s+FROM\\s+.+)\\b/i,                    // Basic SQL Injection
  /<script\\b[^>]*>.*?</script>/i,                         // Cross-Site Scripting (XSS)
  /\\$\\w+\\s*=\\s*\\$_(REQUEST|GET|POST)/i,                 // PHP-like remote code execution
  /` + "`(.*?)`" + `/                                          // Backtick command execution
];

/**
 * Scans a string for known malicious patterns.
 * @param {string} inputString The string to scan.
 * @returns {boolean} True if a suspicious pattern is found.
 */
export function detectTrapdoor(inputString: string): boolean {
  if (typeof inputString !== 'string') {
    return false;
  }

  for (const pattern of trapdoorPatterns) {
    if (pattern.test(inputString)) {
      console.warn(\`Potential trapdoor signature found matching: \${pattern.source}\`);
      return true;
    }
  }
  return false;
}
    `,
  },
];

export default function FunctionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Cloud Functions"
        description="The server-side logic that powers AuthGuard OS, handling user registration, MFA, and security checks."
      />

      <Tabs defaultValue={functions[0].name} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {functions.map((fn) => (
            <TabsTrigger key={fn.name} value={fn.name}>
              {fn.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {functions.map((fn) => (
          <TabsContent key={fn.name} value={fn.name}>
            <Card>
              <CardHeader>
                <CardTitle>{fn.name}</CardTitle>
                <CardDescription>{fn.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold">Input:</h4>
                  <p className="text-sm font-mono text-muted-foreground">{fn.input}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold">Output:</h4>
                  <p className="text-sm font-mono text-muted-foreground">{fn.output}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Code Sample:</h4>
                  <CodeBlock code={fn.code} lang="typescript" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
