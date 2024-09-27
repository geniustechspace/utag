
// Handle different date types
export const getFormattedDate = (date: Date | any) =>
    date instanceof Date
        ? date.toDateString()
        : date.toDate().toDateString(); // If Firestore Timestamp