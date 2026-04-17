import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

function getTaskCollectionRef(userId) {
  if (!userId) {
    throw new Error("Utilisateur invalide. Impossible de charger les taches.");
  }

  return collection(db, "users", userId, "tasks");
}

function getTaskDocRef(userId, taskId) {
  if (!userId) {
    throw new Error("Utilisateur invalide. Impossible de modifier cette tache.");
  }

  if (!taskId) {
    throw new Error("Identifiant de tache manquant.");
  }

  return doc(db, "users", userId, "tasks", taskId);
}

function normalizeTask(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    title: data?.title ?? "",
    description: data?.description ?? "",
    dueDate: data?.dueDate ?? null,
    completed: Boolean(data?.completed),
    priority: data?.priority ?? "medium",
    createdAt: data?.createdAt ?? null,
  };
}

function getFirestoreErrorMessage(error) {
  if (!error || typeof error !== "object") {
    return "Une erreur est survenue. Veuillez réessayer.";
  }

  // Vérifier le code d'erreur Firestore
  const code = error.code || "unknown";

  switch (code) {
    case "permission-denied":
      return "Accès refusé. Vous n'avez pas la permission d'effectuer cette action.";
    case "not-found":
      return "Cette ressource n'existe plus.";
    case "unavailable":
      return "Service temporairement indisponible. Vérifiez votre connexion.";
    case "unauthenticated":
      return "Vous devez être connecté pour effectuer cette action.";
    default:
      return error.message || "Une erreur est survenue. Veuillez réessayer.";
  }
}

export async function getUserTasks(userId) {
  try {
    const tasksQuery = query(getTaskCollectionRef(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(tasksQuery);

    return snapshot.docs.map(normalizeTask);
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function addTask(userId, task) {
  try {
    const title = typeof task?.title === "string" ? task.title.trim() : "";

    if (!title) {
      throw new Error("Le titre de la tache est obligatoire.");
    }

    const taskData = {
      title,
      description: typeof task?.description === "string" ? task.description.trim() : "",
      dueDate: task?.dueDate || null,
      completed: false,
      priority: task?.priority || "medium",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(getTaskCollectionRef(userId), taskData);

    return {
      id: docRef.id,
      ...taskData,
    };
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function updateTask(userId, taskId, updates) {
  try {
    if (!updates || typeof updates !== "object") {
      throw new Error("Les modifications de la tache sont invalides.");
    }

    await updateDoc(getTaskDocRef(userId, taskId), updates);

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function deleteTask(userId, taskId) {
  try {
    await deleteDoc(getTaskDocRef(userId, taskId));

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export function subscribeToTasks(userId, callback, onError, limitCount) {
  try {
    const constraints = [orderBy("createdAt", "desc")];
    if (limitCount && typeof limitCount === "number" && limitCount > 0) {
      constraints.push(limit(limitCount));
    }
    const tasksQuery = query(getTaskCollectionRef(userId), ...constraints);

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasks = snapshot.docs.map(normalizeTask);
        callback(tasks);
      },
      (error) => {
        callback([]);
        if (typeof onError === "function") {
          onError(getFirestoreErrorMessage(error));
        }
      }
    );
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}