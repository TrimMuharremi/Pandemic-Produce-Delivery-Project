/**
 * @Libraries
 */
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import config from "./connection";

/**
 * Initialize firebase
 */
firebase.initializeApp(config);

/**
 *
 * @param user the User object from firebase
 * @param additionalData any additionalData passed in
 * @returns firebase document reference to the user document
 */
export const createUserProfileDocument = async (user, additionalData) => {
  // If user is null
  if (user === null) return;

  // TODO: might want to add the Google account's profile pic!
  // const profilePic = user.photoURL;

  // Reference to the document
  const userRef = firestore.doc(`users/${user.uid}`);

  // Check whether user document exists
  const snapShot = await userRef.get();

  // If data doesn't exist
  if (!snapShot.exists) {
    const { displayName, email } = user;
    const createdAt = new Date();
    try {
      // Populate data
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.log("error creating user", error.message);
      throw error;
    }
  }
  // Return doucment reference
  return userRef;
};

export const addCollectionAndDocuments = async (
  collectionKeys,
  objectsToAdd
) => {
  const collectionRef = firestore.collection(collectionKeys);
  const batch = firestore.batch();
  objectsToAdd.forEach((object) => {
    batch.set(collectionRef.doc(), object);
  });
  return await batch.commit();
};

export const convertProductsToMap = (snapshot) => {
  const products = snapshot.docs.map((doc) => {
    const { title, items } = doc.data();
    return {
      routeName: encodeURI(title.toLowerCase()),
      id: doc.id,
      title,
      items,
    };
  });
  return products.reduce((accumulator, product) => {
    accumulator[product.title.toLowerCase()] = product;
    return accumulator;
  }, {});
};

// Exporting auth and firestore documents
export const auth = firebase.auth();
export const firestore = firebase.firestore();

// Exporting google auth
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;