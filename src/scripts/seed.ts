// A script to seed the Firestore database with some initial data.
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
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
    { userId: "system_generic", status: "success", methodUsed: "Password + OTP", ip: "192.168.1.10", threatDetected: false },
    { userId: "system_generic", status: "success", methodUsed: "Device Key", ip: "10.0.0.5", threatDetected: false },
    { userId: "system_generic", status: "failure", methodUsed: "Password", ip: "203.0.113.45", threatDetected: false },
    { userId: "system_generic", status: "failure", methodUsed: "Password", ip: "172.16.0.21", threatDetected: true },
    { userId: "system_generic", status: "success", methodUsed: "API Token", ip: "127.0.0.1", threatDetected: false },
    { userId: "system_generic", status: "success", methodUsed: "Password", ip: "192.168.1.12", threatDetected: false },
    { userId: "system_generic", status: "failure", methodUsed: "Device Key", ip: "10.0.0.8", threatDetected: false },
];


async function seedDatabase() {
  try {
    console.log('Starting to seed database...');

    const batch = writeBatch(db);

    // Create some generic logs for anonymous users to see
    const logsRef = collection(db, "auth_logs");
    for(const log of authLogs) {
        const logDocRef = doc(logsRef);
        batch.set(logDocRef, {
            ...log,
            timestamp: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
        });
    }

    // Create users in Firebase Auth and add to batch
    for (const userData of users) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            console.log(`Created user: ${user.email} with uid: ${user.uid}`);
            
            const usersCollectionRef = collection(db, "users");
            const userDocRef = doc(usersCollectionRef, userCredential.user.uid);
            
            batch.set(userDocRef, {
                email: userData.email,
                mfaEnabled: userData.mfaEnabled,
                lastLogin: userData.lastLogin,
                failedAttempts: 0,
            });

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
