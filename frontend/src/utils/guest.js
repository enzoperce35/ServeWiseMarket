// utils/guest.js
export function getGuestToken() {
  let token = localStorage.getItem("guest_token");
  if (!token) {
    token = crypto.randomUUID(); // modern way to generate unique ID
    localStorage.setItem("guest_token", token);
  }
  return token;
}
