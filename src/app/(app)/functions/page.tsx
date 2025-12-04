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
    description: "Registers a new user in Firebase Authentication.",
    input: "email, password",
    output: "User UID or error.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const registerUser = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  if (!email || !password || password.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid email and password (min 6 chars) are required.');
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
    });

    return { uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error creating new user.');
  }
});
    `,
  },
  {
    name: "verifyPassword",
    description: "Verifies user credentials and handles MFA flow.",
    input: "email, password",
    output: "Success status, MFA requirement, or custom token.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// This is a conceptual example. Direct password verification is not done in Cloud Functions.
// Instead, the client signs in with email/password, gets an ID token, and sends it here.
export const verifyPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User data not found.');
  }

  const userData = userDoc.data();
  await admin.firestore().collection('users').doc(uid).update({ failedAttempts: 0 });

  if (userData.mfaEnabled) {
    // Logic to initiate MFA (e.g., send OTP)
    return { status: 'mfa_required', mfaType: userData.mfaType };
  }

  // If no MFA, generate custom token directly
  const customToken = await admin.auth().createCustomToken(uid);
  return { status: 'success', token: customToken };
});
    `,
  },
  {
    name: "sendOTP",
    description: "Generates and sends an OTP to the user's registered device/email.",
    input: "userId",
    output: "Success message.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Assume a third-party service for sending OTPs, e.g., Twilio

export const sendOTP = functions.https.onCall(async (data, context) => {
  const { userId } = data;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = admin.firestore.Timestamp.now().toMillis() + (10 * 60 * 1000); // 10 minutes

  await admin.firestore().collection('users').doc(userId).update({
    otp: otp,
    otpExpiry: expiry
  });

  // Send OTP via SMS or email (implementation omitted)
  // await twilio.messages.create({...});
  
  return { status: 'OTP sent' };
});
    `,
  },
  {
    name: "validateOTP",
    description: "Validates the provided OTP.",
    input: "userId, otp",
    output: "Custom auth token or error.",
    code: `
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const validateOTP = functions.https.onCall(async (data, context) => {
  const { userId, otp } = data;
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found.');
  }

  const userData = userDoc.data();
  if (userData.otp !== otp || userData.otpExpiry < Date.now()) {
    await userRef.update({ failedAttempts: admin.firestore.FieldValue.increment(1) });
    throw new functions.https.HttpsError('invalid-argument', 'Invalid or expired OTP.');
  }

  // Clear OTP and generate custom token
  await userRef.update({ otp: null, otpExpiry: null });
  const customToken = await admin.auth().createCustomToken(userId);
  
  return { status: 'success', token: customToken };
});
    `,
  },
  {
    name: "detectOverflowPayload",
    description: "Detects potential buffer overflow attacks by checking payload size.",
    input: "payload (string)",
    output: "Boolean indicating if an overflow is suspected.",
    code: `
const MAX_PAYLOAD_SIZE = 1024; // 1KB

export function detectOverflowPayload(payload: string): boolean {
  if (typeof payload !== 'string') return false;
  
  // Check byte length, which is more accurate for multi-byte characters
  const byteLength = new TextEncoder().encode(payload).length;
  
  if (byteLength > MAX_PAYLOAD_SIZE) {
    console.warn(\`Potential overflow detected. Payload size: \${byteLength} bytes.\`);
    return true;
  }
  return false;
}
    `,
  },
  {
    name: "detectTrapdoor",
    description: "Scans input for common trapdoor/backdoor signatures.",
    input: "inputString (string)",
    output: "Boolean indicating if a trapdoor is suspected.",
    code: `
const trapdoorPatterns = [
  /\\b(exec|shell_exec|system|passthru|eval)\\b/i, // Command execution
  /\\b(SELECT\\s+\\*\\s+FROM\\s+users)\\b/i, // Common SQLi
  /\\$\\w+\\s*=\\s*\\$_REQUEST/i, // PHP-like variable assignment from request
  /` + "`(.*?)`" + `/ // Backtick command execution
];

export function detectTrapdoor(inputString: string): boolean {
  if (typeof inputString !== 'string') return false;

  for (const pattern of trapdoorPatterns) {
    if (pattern.test(inputString)) {
      console.warn(\`Potential trapdoor signature found: \${pattern.source}\`);
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
        description="Backend logic for handling authentication, security, and MFA."
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
