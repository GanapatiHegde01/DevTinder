const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7777";

async function request(path, options = {}) {
  const hasBody = options.body !== undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload.message || "Something went wrong";
    throw new Error(message);
  }

  return payload;
}

export const api = {
  signup: (data) => request("/signup", { method: "POST", body: data }),
  login: (data) => request("/login", { method: "POST", body: data }),
  logout: () => request("/logout", { method: "POST" }),
  profile: () => request("/profile"),
  updateProfile: (data) =>
    request("/profile/edit", { method: "PATCH", body: data }),
  changePassword: (data) =>
    request("/profile/password", { method: "PATCH", body: data }),
  feed: ({ page = 1, limit = 10 } = {}) =>
    request(`/feed?page=${page}&limit=${limit}`),
  sendRequest: ({ status, toUserId }) =>
    request(`/request/send/${status}/${toUserId}`, { method: "POST" }),
  receivedRequests: () => request("/user/requests/received"),
  reviewRequest: ({ status, requestId }) =>
    request(`/request/review/${status}/${requestId}`, { method: "POST" }),
  connections: () => request("/user/requests/connections"),
};
