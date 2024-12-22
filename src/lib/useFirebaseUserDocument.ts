import { doc, DocumentData, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import initializeFirebaseClient from './initFirebase';
import useFirebaseUser from './useFirebaseUser';

export default function useFirebaseDocument() {
  const { db } = initializeFirebaseClient();
  const { user, isLoading: loadingUser } = useFirebaseUser();
  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<DocumentData | null>(null);

  useEffect(() => {
    if (!loadingUser && user && db) {
      (async () => {
        const docRef = doc(db, 'users', user.uid.toLocaleLowerCase());
        const listener = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setDocument({
              ...doc.data(),
              id: doc.id,
            });
          } else {
            setDocument(null);
          }
          setIsLoading(false);
        });

        return () => {
          listener();
        };
      })();
    } else {
      setIsLoading(false);
    }
  }, [db, user, loadingUser]);

  return { isLoading, document };
}
