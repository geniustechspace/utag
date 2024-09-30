import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot, StorageError } from "firebase/storage";

import { storage } from "@/config/firebase-config";

export const uploadToStorage = async (
    file: File,
    onStateChanged?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `product images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => onStateChanged && onStateChanged(snapshot),
            (error) => {
                // Handle unsuccessful uploads
                onError && onError(error)
                reject(error);
            },
            () => {
                // Handle successful uploads
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            },
        );
    });
};
