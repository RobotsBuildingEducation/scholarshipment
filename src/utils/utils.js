import { database } from "../database/setup";

export const updateUserData = async (userId) => {
  const userDocRef = doc(database, "users", userId);
  // await updateDoc(userDocRef);
};
