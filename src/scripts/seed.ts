// A script to seed the Firestore database with some initial data.
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../firebase/config'; // Adjust the path as needed

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const users = [
  { email: "olivia.martin@email.com", password: "password123", mfaEnabled: true, lastLogin: new Date().toISOString() },
  { email: "liam.johnson@email.com", password: "password123", mfaEnabled: true, lastLogin: new Date().toISOString() },
  { email: "noah.williams@email.com", password: "password123", mfaEnabled: false, lastLogin: new Date().toISOString() },
  { email: "emma.brown@email.com", password: "password123", mfaEnabled: true, lastLogin: new Date().toISOString() },
  { email: "svc-runner@os.local", password: "password123", mfaEnabled: false, lastLogin: new Date().toISOString() },
];

const authLogs = [
    { status: "success", methodUsed: "Password + OTP", ip: "192.168.1.10", threatDetected: false },
    { status: "success", methodUsed: "Device Key", ip: "10.0.0.5", threatDetected: false },
    { status: "failure", methodUsed: "Password", ip: "203.0.113.45", threatDetected: false },
    { status: "failure", methodUsed: "Password", ip: "172.16.0.21", threatDetected: true },
    { status: "success", methodUsed: "API Token", ip: "127.0.0.1", threatDetected: false },
    { status: "success", methodUsed: "Password", ip: "192.168.1.12", threatDetected: false },
    { status: "failure", methodUsed: "Device Key", ip: "10.0.0.8", threatDetected: false },
];


async function seedDatabase() {
  try {
    console.log('Starting to seed database...');

    const batch = writeBatch(db);

    // Create users in Firebase Auth and add to batch
    for (const userData of users) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            console.log(`Created user: ${user.email} with uid: ${user.uid}`);
            
            const usersRef = collection(db, "users");
            const userDocRef = userCredential.user.uid;
            
            batch.set(doc(usersRef, userDocRef), {
                email: userData.email,
                mfaEnabled: userData.mfaEnabled,
                lastLogin: userData.lastLogin,
                failedAttempts: 0,
            });

            // Create some logs for this user
            const logsRef = collection(db, "auth_logs");
            for(let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
                const randomLog = authLogs[Math.floor(Math.random() * authLogs.length)];
                batch.add(logsRef, {
                    ...randomLog,
                    userId: user.uid,
                    timestamp: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
                });
            }

        } catch (error: any) {
             if (error.code === 'auth/email-already-in-use') {
                console.log(`User ${userData.email} already exists. Skipping.`);
             } else {
                console.error(`Error creating user ${userData.email}:`, error);
             }
        }
    }

    // Commit the batch
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}


// To run this script, you would use ts-node:
// npx ts-node -r tsconfig-paths/register src/scripts/seed.ts
// Make sure you have ts-node and tsconfig-paths installed.
// Or compile and run with node.
console.log("This script will seed the database. Make sure your Firebase config is correct.");
console.log("NOTE: This creates users in Firebase Authentication and costs money.");
seedDatabase();
