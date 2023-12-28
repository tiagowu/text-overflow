const formatDate = (newDate) => {
  var date = new Date(newDate);
  const now = new Date();
  const timeDifference = Math.floor((now - date) / 1000);

  if (timeDifference < 60) {
    return `${timeDifference} seconds ago`;
  } else if (timeDifference < 3600) {
    const minutes = Math.floor(timeDifference / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (timeDifference < 86400) {
    const hours = Math.floor(timeDifference / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (now.getFullYear() === date.getFullYear()) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} 
      at ${hours}:${minutes}`;
  } else {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const options = { year: "numeric", month: "short", day: "numeric" };
    return `${date.toLocaleDateString("en-US", options)} at ${hours}:${minutes}`;
  }
};

export default formatDate;
