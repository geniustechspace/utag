
import { storage } from "@/config/firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `product images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress monitoring (optional)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        // Handle unsuccessful uploads
        reject(error);
      },
      () => {
        // Handle successful uploads
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};
