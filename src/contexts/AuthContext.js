"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth } from "../lib/firebase";

const AuthContext = createContext(undefined);

const FIREBASE_ERROR_MESSAGES = {
  "auth/email-already-in-use": "Cette adresse e-mail est deja utilisee. Essayez de vous connecter.",
  "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
  "auth/weak-password": "Le mot de passe est trop court. Utilisez au moins 6 caracteres.",
  "auth/user-not-found": "Aucun compte trouve avec cette adresse e-mail.",
  "auth/wrong-password": "Mot de passe incorrect. Verifiez votre mot de passe et reessayez.",
  "auth/too-many-requests": "Trop de tentatives. Reessayez plus tard.",
  "auth/invalid-credential": "Identifiants invalides. Verifiez votre e-mail et mot de passe.",
};

function getFirebaseErrorMessage(error) {
  if (!error || typeof error !== "object") {
    return "Une erreur est survenue. Veuillez reessayer.";
  }

  return FIREBASE_ERROR_MESSAGES[error.code] || "Une erreur est survenue. Veuillez reessayer.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (firebaseError) => {
        setError(getFirebaseErrorMessage(firebaseError));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signUp = useCallback(async (email, password) => {
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (firebaseError) {
      setError(getFirebaseErrorMessage(firebaseError));
      throw firebaseError;
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (firebaseError) {
      setError(getFirebaseErrorMessage(firebaseError));
      throw firebaseError;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential;
    } catch (firebaseError) {
      setError(getFirebaseErrorMessage(firebaseError));
      throw firebaseError;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);

    try {
      await firebaseSignOut(auth);
    } catch (firebaseError) {
      setError(getFirebaseErrorMessage(firebaseError));
      throw firebaseError;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [error, loading, signIn, signInWithGoogle, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthContext };
