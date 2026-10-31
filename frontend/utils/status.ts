type Status = "initial" | "inprogress" | "paused" | "end";

interface StatusDetails {
  color: string;
  text: string;
}

const getStatusDetails = (status: Status): StatusDetails => {
  switch (status) {
    case "initial":
      return {
        color: "#6366F1", // Indigo
        text: "Non commencé", // French for "Not Started"
      };
    case "inprogress":
      return {
        color: "#22C55E", // Green
        text: "En cours", // French for "In Progress"
      };
    case "paused":
      return {
        color: "#EAB308", // Yellow
        text: "En pause", // French for "Paused"
      };
    case "end":
      return {
        color: "#64748B", // Slate
        text: "Terminé", // French for "Completed"
      };
    default:
      return {
        color: "#6366F1", // Default color: Indigo
        text: "Inconnu", // French for "Unknown"
      };
  }
};

export default getStatusDetails;