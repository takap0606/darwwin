import { useEffect, useState } from 'react';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import initializeFirebaseClient from './initFirebase';

export default function useFirebase(): {
  db: Firestore | null;
  auth: Auth | null;
} {
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const { db: firestoreInstance, auth: authInstance } =
      initializeFirebaseClient();

    setDb(firestoreInstance);
    setAuth(authInstance);
  }, []);

  return {
    db,
    auth,
  };
}
