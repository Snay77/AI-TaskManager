import {
  arrayRemove,
  arrayUnion,
  addDoc,
  collection,
  deleteField,
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

export const SHARED_LIST_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  EDITOR: "editor",
  READER: "reader",
};

const EDITABLE_ROLES = [SHARED_LIST_ROLES.ADMIN, SHARED_LIST_ROLES.EDITOR, SHARED_LIST_ROLES.READER];

function isValidSharedListRole(role) {
  return Object.values(SHARED_LIST_ROLES).includes(role);
}

function normalizeMemberRoles(listData) {
  const members = Array.isArray(listData?.members) ? listData.members : [];
  const sourceRoles = listData?.memberRoles && typeof listData.memberRoles === "object"
    ? listData.memberRoles
    : {};
  const ownerId = listData?.ownerId ?? "";

  return members.reduce((accumulator, memberId) => {
    if (memberId === ownerId) {
      accumulator[memberId] = SHARED_LIST_ROLES.OWNER;
      return accumulator;
    }

    const existingRole = sourceRoles[memberId];
    accumulator[memberId] = isValidSharedListRole(existingRole)
      ? existingRole
      : SHARED_LIST_ROLES.EDITOR;
    return accumulator;
  }, {});
}

function getMemberRole(listData, userId) {
  if (!userId) {
    return null;
  }

  const roles = normalizeMemberRoles(listData);
  return roles[userId] || null;
}

function canManageMembers(listData, actorUserId) {
  const actorRole = getMemberRole(listData, actorUserId);
  return actorRole === SHARED_LIST_ROLES.OWNER || actorRole === SHARED_LIST_ROLES.ADMIN;
}

function canManageTasks(listData, actorUserId) {
  const actorRole = getMemberRole(listData, actorUserId);
  return (
    actorRole === SHARED_LIST_ROLES.OWNER ||
    actorRole === SHARED_LIST_ROLES.ADMIN ||
    actorRole === SHARED_LIST_ROLES.EDITOR
  );
}

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
  const memberRoles = normalizeMemberRoles(data);

  return {
    id: docSnapshot.id,
    name: data?.name ?? "",
    ownerId: data?.ownerId ?? "",
    members: Array.isArray(data?.members) ? data.members : [],
    memberRoles,
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
      memberRoles: {
        [userId]: SHARED_LIST_ROLES.OWNER,
      },
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

export function subscribeToSharedLists(userId, callback, onError) {
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
        if (typeof onError === "function") {
          onError(getFirestoreErrorMessage(error));
        }
      }
    );
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function addMemberToList(listId, email, actorUserId) {
  try {
    if (!actorUserId) {
      throw new Error("Utilisateur invalide. Impossible d'ajouter ce membre.");
    }

    const userId = await getUserIdByEmail(email);
    const listData = await getSharedListData(listId);
    const members = Array.isArray(listData?.members) ? listData.members : [];

    if (!canManageMembers(listData, actorUserId)) {
      throw new Error("Seuls le proprietaire et les admins peuvent ajouter des membres.");
    }

    if (members.includes(userId)) {
      throw new Error("Cette personne est deja membre de cette liste.");
    }

    await updateDoc(getSharedListDocRef(listId), {
      members: arrayUnion(userId),
      [`memberRoles.${userId}`]: SHARED_LIST_ROLES.READER,
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

    if (!canManageMembers(listData, actorUserId)) {
      throw new Error("Seuls le proprietaire et les admins peuvent retirer un membre.");
    }

    const targetRole = getMemberRole(listData, memberId);
    if (targetRole === SHARED_LIST_ROLES.OWNER) {
      throw new Error("Le proprietaire ne peut pas etre retire de la liste.");
    }

    const actorRole = getMemberRole(listData, actorUserId);
    if (actorRole === SHARED_LIST_ROLES.ADMIN && targetRole === SHARED_LIST_ROLES.ADMIN) {
      throw new Error("Un admin ne peut pas retirer un autre admin.");
    }

    const members = Array.isArray(listData?.members) ? listData.members : [];
    if (!members.includes(memberId)) {
      throw new Error("Ce membre n'appartient pas a cette liste.");
    }

    await updateDoc(listRef, {
      members: arrayRemove(memberId),
      [`memberRoles.${memberId}`]: deleteField(),
    });

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function updateMemberRole(listId, targetMemberId, role, actorUserId) {
  try {
    if (!actorUserId) {
      throw new Error("Utilisateur invalide. Impossible de modifier ce role.");
    }

    if (!targetMemberId) {
      throw new Error("Membre invalide. Impossible de modifier ce role.");
    }

    if (!isValidSharedListRole(role) || role === SHARED_LIST_ROLES.OWNER) {
      throw new Error("Role invalide.");
    }

    const listData = await getSharedListData(listId);
    const members = Array.isArray(listData?.members) ? listData.members : [];
    const actorRole = getMemberRole(listData, actorUserId);
    const targetRole = getMemberRole(listData, targetMemberId);

    if (!members.includes(targetMemberId) || !targetRole) {
      throw new Error("Ce membre n'appartient pas a cette liste.");
    }

    if (targetRole === SHARED_LIST_ROLES.OWNER) {
      throw new Error("Le role du proprietaire ne peut pas etre modifie.");
    }

    if (actorRole === SHARED_LIST_ROLES.OWNER) {
      if (!EDITABLE_ROLES.includes(role)) {
        throw new Error("Role invalide.");
      }
    } else if (actorRole === SHARED_LIST_ROLES.ADMIN) {
      const adminAllowedRoles = [SHARED_LIST_ROLES.EDITOR, SHARED_LIST_ROLES.READER];
      if (!adminAllowedRoles.includes(targetRole) || !adminAllowedRoles.includes(role)) {
        throw new Error("Un admin ne peut modifier que les roles editeur et lecteur.");
      }
    } else {
      throw new Error("Vous n'avez pas la permission de modifier les roles.");
    }

    await updateDoc(getSharedListDocRef(listId), {
      [`memberRoles.${targetMemberId}`]: role,
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
    if (!userId) {
      throw new Error("Utilisateur invalide. Impossible d'ajouter une tache partagee.");
    }

    const listData = await getSharedListData(listId);
    if (!canManageTasks(listData, userId)) {
      throw new Error("Acces refuse. Vous n'avez pas la permission d'effectuer cette action.");
    }

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

export async function updateSharedTask(listId, taskId, updates, userId) {
  try {
    if (!userId) {
      throw new Error("Utilisateur invalide. Impossible de modifier cette tache.");
    }

    if (!updates || typeof updates !== "object") {
      throw new Error("Les modifications de la tache sont invalides.");
    }

    const listData = await getSharedListData(listId);
    if (!canManageTasks(listData, userId)) {
      throw new Error("Acces refuse. Vous n'avez pas la permission d'effectuer cette action.");
    }

    await updateDoc(getSharedListTaskDocRef(listId, taskId), updates);

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export async function deleteSharedTask(listId, taskId, userId) {
  try {
    if (!userId) {
      throw new Error("Utilisateur invalide. Impossible de supprimer cette tache.");
    }

    const listData = await getSharedListData(listId);
    if (!canManageTasks(listData, userId)) {
      throw new Error("Acces refuse. Vous n'avez pas la permission d'effectuer cette action.");
    }

    await deleteDoc(getSharedListTaskDocRef(listId, taskId));

    return true;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

export function subscribeToSharedTasks(listId, callback, onError) {
  try {
    const tasksQuery = query(getSharedListTasksCollectionRef(listId), orderBy("createdAt", "desc"));

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        callback(snapshot.docs.map(normalizeSharedTask));
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
