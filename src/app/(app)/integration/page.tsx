
import { PageHeader } from "@/components/page-header";
import { CodeBlock } from "@/components/code-block";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const nodeJsCode = `
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, getIdToken } = require('firebase/auth');
const axios = require('axios');

// This should be your web Firebase config
const firebaseConfig = { /* ... your Firebase config ... */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Your backend endpoint that requires a Firebase ID Token for authentication
const API_BASE_URL = 'https://<region>-<project-id>.cloudfunctions.net';

async function verifyCredentialsAndGetSession(email, password) {
  try {
    // 1. Sign in the user on the client-side
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Client-side sign-in successful for:', user.uid);

    // 2. Get the ID Token from the signed-in user
    const idToken = await getIdToken(user);

    // 3. Call your secure backend function with the ID token
    const response = await axios.post(\`\${API_BASE_URL}/verifyUserAndGetSession\`, {}, {
      headers: {
        'Authorization': \`Bearer \${idToken}\`
      }
    });

    const { status, token: sessionToken, mfaType } = response.data;

    if (status === 'success' && sessionToken) {
      console.log('Custom session token received. Session established.');
      // In a real OS, you would now use this sessionToken for subsequent admin operations.
      return { success: true, sessionToken };
    } else if (status === 'mfa_required') {
      console.log(\`MFA is required. Type: \${mfaType}\`);
      // Initiate the MFA flow (e.g., prompt for OTP)
      return { mfaRequired: true, mfaType };
    }
  } catch (error) {
    console.error('Authentication failed:', error.message);
    // Log the failed auth event
    // logAuthEvent(null, 'failure', 'Invalid credentials');
    return { success: false, error: error.message };
  }
}

// Example usage
verifyCredentialsAndGetSession('user@example.com', 'password123');
`;

const pythonCode = `
import requests
import json

# Use the Firebase Admin SDK on a server to verify tokens, or a client library for client-side auth.
# This example simulates a client calling a secure server endpoint.

# Your web API key from your Firebase project settings
API_KEY = "YOUR_WEB_API_KEY"
SIGN_IN_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"

# Your secure backend endpoint
SECURE_ENDPOINT = "https://<region>-<project-id>.cloudfunctions.net/verifyUserAndGetSession"

def verify_credentials(email, password):
    """
    Simulates a client signing in and then calling a secure backend.
    """
    try:
        # 1. Sign in using the Firebase Auth REST API to get an ID Token
        payload = json.dumps({
            "email": email,
            "password": password,
            "returnSecureToken": True
        })
        r = requests.post(SIGN_IN_URL, data=payload)
        r.raise_for_status()
        id_token = r.json().get("idToken")
        print("Client sign-in successful.")

        # 2. Call your secure backend with the ID Token
        headers = {"Authorization": f"Bearer {id_token}"}
        response = requests.post(SECURE_ENDPOINT, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        status = data.get("status")

        if status == "success":
            print(f"Session token received: {data.get('token')[:30]}...")
            return data
        elif status == "mfa_required":
            print(f"MFA is required. Type: {data.get('mfaType')}")
            return data

    except requests.exceptions.HTTPError as e:
        print(f"Authentication failed: {e.response.text}")
        return None

# Example
verify_credentials("user@example.com", "password123")
`;

const javaCode = `
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson; // Example JSON library

// This example simulates a Java client (like an Android app) authenticating.
// You would typically use the Firebase SDK for Java/Android.

public class OsIntegration {

    private static final String API_KEY = "YOUR_WEB_API_KEY";
    private static final String SIGN_IN_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY;
    private static final String SECURE_ENDPOINT = "https://<region>-<project-id>.cloudfunctions.net/verifyUserAndGetSession";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();

    public static void main(String[] args) {
        verifyCredentials("user@example.com", "password123");
    }

    public static void verifyCredentials(String email, String password) {
        try {
            // 1. Authenticate with Firebase Auth REST API to get an ID Token
            String requestBody = String.format("{\\"email\\":\\"%s\\",\\"password\\":\\"%s\\",\\"returnSecureToken\\":true}", email, password);

            HttpRequest signInRequest = HttpRequest.newBuilder()
                    .uri(URI.create(SIGN_IN_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> signInResponse = client.send(signInRequest, HttpResponse.BodyHandlers.ofString());

            if (signInResponse.statusCode() != 200) {
                throw new RuntimeException("Failed to sign in: " + signInResponse.body());
            }

            SignInResponse authResponse = gson.fromJson(signInResponse.body(), SignInResponse.class);
            System.out.println("Client sign-in successful.");

            // 2. Call your secure backend function with the ID token
            HttpRequest secureRequest = HttpRequest.newBuilder()
                    .uri(URI.create(SECURE_ENDPOINT))
                    .header("Authorization", "Bearer " + authResponse.idToken)
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> secureResponse = client.send(secureRequest, HttpResponse.BodyHandlers.ofString());
            System.out.println("Secure endpoint response: " + secureResponse.body());

        } catch (Exception e) {
            System.err.println("Authentication process failed: " + e.getMessage());
        }
    }

    // Helper class for JSON parsing
    static class SignInResponse {
        String idToken;
        String email;
    }
}
`;


export default function IntegrationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="OS Integration API"
        description="Code samples demonstrating how a client OS can integrate with AuthGuard's Firebase backend."
      />

      <Tabs defaultValue="nodejs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="java">Java</TabsTrigger>
        </TabsList>
        <TabsContent value="nodejs">
            <Card>
                <CardContent className="p-4">
                    <CodeBlock code={nodeJsCode} lang="javascript" />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="python">
           <Card>
                <CardContent className="p-4">
                    <CodeBlock code={pythonCode} lang="python" />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="java">
            <Card>
                <CardContent className="p-4">
                    <CodeBlock code={javaCode} lang="java" />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
