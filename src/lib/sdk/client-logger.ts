function clientLogger<T>(level: string, message: string, ...meta: T[]) {
  // Send log message to the server-side logging API
  fetch("/api/logger", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ level, message: `${message} ${meta.join(" ")}` }),
  }).catch((error) => {
    // If the request fails, log the error to the browser console
    console.error("Failed to send log message to server:", error);
  });
}

export default clientLogger;