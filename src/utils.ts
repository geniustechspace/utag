// Handle different date types: Date, Firestore Timestamp, and date strings
export const getFormattedDate = (date: Date | any) => {

  if (date instanceof Date) {
    // If it's already a Date object
    return date.toDateString();

  } else if (date?.toDate instanceof Function) {
    // If it's a Firestore Timestamp with a toDate method
    return date.toDate().toDateString();

  } else if (typeof date === "string") {
    // If it's a string, attempt to parse it as a Date
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) ? parsedDate.toDateString() : "Invalid date";
  }
  return "Invalid date"; // Fallback for unrecognized date formats
};
