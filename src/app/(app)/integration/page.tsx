import { PageHeader } from "@/components/page-header";
import { CodeBlock } from "@/components/code-block";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const nodeJsCode = `
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');
const axios = require('axios');

const firebaseConfig = { /* ... your config ... */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const API_BASE_URL = 'https://<region>-<project-id>.cloudfunctions.net';

async function verifyCredentials(email, password) {
  // NOTE: In a real OS, you'd use a secure client-side flow.
  // This example simulates calling a backend function that returns a custom token.
  // We assume a function 'generateCustomAuthToken' exists for this.
  try {
    const response = await axios.post(\`\${API_BASE_URL}/generateCustomAuthToken\`, { email, password });
    const { token } = response.data;
    
    if (token) {
      const userCredential = await signInWithCustomToken(auth, token);
      console.log('Login successful for user:', userCredential.user.uid);
      // Log the event
      logAuthEvent(userCredential.user.uid, 'success');
      return userCredential.user;
    } else {
        // Handle MFA flow
        console.log('MFA required');
    }
  } catch (error) {
    console.error('Authentication failed:', error.message);
    logAuthEvent(null, 'failure', 'Invalid credentials');
  }
}

async function logAuthEvent(userId, status, threatDetected = null) {
  await axios.post(\`\${API_BASE_URL}/logSecurityEvent\`, { 
      userId, 
      status, 
      threatDetected,
      methodUsed: 'password',
      ip: '127.0.0.1' 
    });
}

// Example usage
verifyCredentials('user@example.com', 'password123');
`;

const pythonCode = `
import firebase_admin
from firebase_admin import credentials, auth
import requests

# Initialize Firebase Admin SDK
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

API_BASE_URL = 'https://<region>-<project-id>.cloudfunctions.net'

def verify_credentials(email, password):
    """
    Client-side verification is complex. This simulates getting a custom token from a backend function.
    """
    try:
        # Assume a 'generateCustomAuthToken' function exists on the backend
        response = requests.post(f"{API_BASE_URL}/generateCustomAuthToken", json={'email': email, 'password': password})
        response.raise_for_status()

        custom_token = response.json().get('token')
        
        # This part is typically done on a client, not with Admin SDK.
        # But for demonstration, we verify the token's validity.
        decoded_token = auth.verify_id_token(custom_token) # This would be an ID token in reality
        uid = decoded_token['uid']
        print(f"Successfully verified token for user: {uid}")
        log_auth_event(uid, 'success')
        return uid
    except Exception as e:
        print(f"Authentication failed: {e}")
        log_auth_event(None, 'failure', 'Invalid credentials')
        return None

def log_auth_event(user_id, status, threat_detected=None):
    """Logs an authentication event to Firestore via a Cloud Function."""
    requests.post(f"{API_BASE_URL}/logSecurityEvent", json={
        'userId': user_id,
        'status': status,
        'threatDetected': threat_detected,
        'methodUsed': 'password',
        'ip': '127.0.0.1'
    })

# Example usage
verify_credentials('user@example.com', 'password123')
`;

const javaCode = `
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
// HTTP client library like OkHttp or HttpClient needed

import java.io.FileInputStream;
import java.io.IOException;

public class OsIntegration {

    private static final String API_BASE_URL = "https://<region>-<project-id>.cloudfunctions.net";

    public static void main(String[] args) throws IOException {
        FileInputStream serviceAccount = new FileInputStream("path/to/serviceAccountKey.json");

        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        FirebaseApp.initializeApp(options);

        verifyCredentials("user@example.com", "password123");
    }

    public static void verifyCredentials(String email, String password) {
        // This simulates a call to a backend function that returns a custom token
        // In a real scenario, you'd use a client SDK to sign in and get an ID token.
        try {
            // Assume a function 'generateCustomAuthToken' exists.
            // Using an HTTP client, post email/password and get the custom token.
            String customToken = getCustomTokenFromServer(email, password); // Placeholder for HTTP call
            
            // This is for demonstration. Client SDKs handle this verification.
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(customToken); // Would be ID token
            String uid = decodedToken.getUid();
            System.out.println("Successfully verified token for user: " + uid);
            logAuthEvent(uid, "success", null);
        } catch (Exception e) {
            System.err.println("Authentication failed: " + e.getMessage());
            logAuthEvent(null, "failure", "Invalid credentials");
        }
    }
    
    // Placeholder for actual HTTP call
    private static String getCustomTokenFromServer(String email, String password) {
        // Use OkHttp, HttpClient, etc., to POST to your Cloud Function and get the token
        return "dummy-token";
    }

    public static void logAuthEvent(String userId, String status, String threatDetected) {
        // Use an HTTP client to POST event data to the 'logSecurityEvent' Cloud Function
        System.out.println("Logging event for user: " + userId + " with status: " + status);
    }
}
`;


export default function IntegrationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="OS Integration API"
        description="Code samples demonstrating how an OS can integrate with AuthGuard's Firebase backend."
      />

      <Tabs defaultValue="nodejs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="java">Java</TabsTrigger>
        </TabsList>
        <TabsContent value="nodejs">
          <CodeBlock code={nodeJsCode} lang="javascript" />
        </TabsContent>
        <TabsContent value="python">
          <CodeBlock code={pythonCode} lang="python" />
        </TabsContent>
        <TabsContent value="java">
          <CodeBlock code={javaCode} lang="java" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
