export default function authHeader() {
  const userStr = localStorage.getItem("user");
  let user = null;
  if (userStr) user = JSON.parse(userStr);
  const token = user?.accessToken ? `Bearer ${user.accessToken}` : ""
  return { Authorization: token }
}
