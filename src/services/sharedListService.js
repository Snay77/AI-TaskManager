import {
  arrayRemove,
  arrayUnion,
  addDoc,
  collection,
  deleteDoc,
  getDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

function getSharedListsCollectionRef() {
  return collection(db, "sharedLists");
}

function getSharedListDocRef(listId) {
  if (!listId) {
    throw new Error("Identifiant de liste manquant.");
  }

  return doc(db, "sharedLists", listId);
}

function getSharedListTasksCollectionRef(listId) {
  if (!listId) {
    throw new Error("Identifiant de liste manquant.");
  }

  return collection(db, "sharedLists", listId, "tasks");
}

function getSharedListTaskDocRef(listId, taskId) {
  if (!listId) {
    throw new Error("Identifiant de liste manquant.");
  }

  if (!taskId) {
    throw new Error("Identifiant de tache manquant.");
  }

  return doc(db, "sharedLists", listId, "tasks", taskId);
}

function normalizeSharedList(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    name: data?.name ?? "",
    ownerId: data?.ownerId ?? "",
    members: Array.isArray(data?.members) ? data.members : [],
    createdAt: data?.createdAt ?? null,
  };
}

function normalizeSharedTask(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    title: data?.title ?? "",
    description: data?.description ?? "",
    dueDate: data?.dueDate ?? null,
    completed: Boolean(data?.completed),
    priority: data?.priority ?? "medium",
    createdAt: data?.createdAt ?? null,
    addedBy: data?.addedBy ?? "",
  };
}

function getFirestoreErrorMessage(error) {
  if (!error || typeof error !== "object") {
    return "Une erreur est survenue lors de la gestion des listes partagees. Veuillez reessayer.";
  }

  return error.message || "Une erreur est survenue lors de la gestion des listes partagees. Veuillez reessayer.";
}

async function getUserIdByEmail(email) {
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!cleanEmail) {
    throw new Error("L'adresse e-mail est obligatoire.");
  }

  const usersQuery = query(
    collection(db, "users"),
    where("email", "==", cleanEmail),
    limit(1)
  );
  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) {
    throw new Error("Aucun utilisateur trouve pour cette adresse e-mail.");
  }

  return snapshot.docs[0].id;
}

async function getSharedListData(listId) {
  const snapshot = await getDoc(getSharedListDocRef(listId));

  if (!snapshot.exists()) {
    throw new Error("La liste partagee est introuvable.");
  }

  return snapshot.data();
}

export async function createSharedList(userId, name) {
  try {
    const cleanName = typeof name === "string" ? name.trim() : "";

    if (!userId) {
      throw new Error("Utilisateur invalide. Impossible de creer la liste partagee.");
    }

    if (!cleanName) {
      throw new Error("Le nom de la liste est obligatoire.");
    }

    const listData = {
      name: cleanName,
      ownerId: userId,
      members: [userId],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(getSharedListsCollectionRef(), listData);

    return {
      id: docRef.id,
      ...listData,
    };
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function getUserSharedLists(userId) {
  try {
    if (!userId) {
      throw new Error("Utilisateur invalide. Impossible de charger les listes partagees.");
    }

    const listsQuery = query(
      getSharedListsCollectionRef(),
      where("members", "array-contains", userId)
    );
    const snapshot = await getDocs(listsQuery);

    return snapshot.docs.map(normalizeSharedList);
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export function subscribeToSharedLists(userId, callback) {
  try {
    if (!userId) {
      throw new Error("Utilisateur invalide. Impossible d'ecouter les listes partagees.");
    }

    const listsQuery = query(
      getSharedListsCollectionRef(),
      where("members", "array-contains", userId)
    );

    return onSnapshot(
      listsQuery,
      (snapshot) => {
        callback(snapshot.docs.map(normalizeSharedList));
      },
      (error) => {
        callback([]);
        console.error(getFirestoreErrorMessage(error));
      }
    );
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function addMemberToList(listId, email) {
  try {
    const userId = await getUserIdByEmail(email);
    await updateDoc(getSharedListDocRef(listId), {
      members: arrayUnion(userId),
    });

    return userId;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function removeMemberFromList(listId, memberId, actorUserId) {
  try {
    if (!memberId) {
      throw new Error("Utilisateur invalide. Impossible de retirer ce membre.");
    }

    const listRef = getSharedListDocRef(listId);
    const listData = await getSharedListData(listId);

    if (!actorUserId) {
      throw new Error("Utilisateur invalide. Impossible de retirer ce membre.");
    }

    if (listData?.ownerId !== actorUserId) {
      throw new Error("Seul le proprietaire peut retirer un membre.");
    }

    if (listData?.ownerId === memberId) {
      throw new Error("Le proprietaire ne peut pas etre retire de la liste.");
    }

    const members = Array.isArray(listData?.members) ? listData.members : [];
    if (!members.includes(memberId)) {
      throw new Error("Ce membre n'appartient pas a cette liste.");
    }

    await updateDoc(listRef, {
      members: arrayRemove(memberId),
    });

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

async function deleteSharedListTasks(listId) {
  const tasksSnapshot = await getDocs(getSharedListTasksCollectionRef(listId));
  const deletions = tasksSnapshot.docs.map((taskDoc) => deleteDoc(taskDoc.ref));
  await Promise.all(deletions);
}

export async function deleteSharedList(listId, userId) {
  try {
    const listRef = getSharedListDocRef(listId);
    const listData = await getSharedListData(listId);

    if (listData?.ownerId !== userId) {
      throw new Error("Seul le proprietaire peut supprimer cette liste.");
    }

    await deleteSharedListTasks(listId);
    await deleteDoc(listRef);

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function getSharedListTasks(listId) {
  try {
    const tasksQuery = query(getSharedListTasksCollectionRef(listId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(tasksQuery);

    return snapshot.docs.map(normalizeSharedTask);
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function addSharedTask(listId, userId, task) {
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
      addedBy: userId,
    };

    const docRef = await addDoc(getSharedListTasksCollectionRef(listId), taskData);

    return {
      id: docRef.id,
      ...taskData,
    };
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function updateSharedTask(listId, taskId, updates) {
  try {
    if (!updates || typeof updates !== "object") {
      throw new Error("Les modifications de la tache sont invalides.");
    }

    await updateDoc(getSharedListTaskDocRef(listId, taskId), updates);

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function deleteSharedTask(listId, taskId) {
  try {
    await deleteDoc(getSharedListTaskDocRef(listId, taskId));

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export function subscribeToSharedTasks(listId, callback) {
  try {
    const tasksQuery = query(getSharedListTasksCollectionRef(listId), orderBy("createdAt", "desc"));

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        callback(snapshot.docs.map(normalizeSharedTask));
      },
      (error) => {
        callback([]);
        console.error(getFirestoreErrorMessage(error));
      }
    );
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}
