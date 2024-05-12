const getTokenType = () => {
  const user = getUser();
  return user?.type;
};

const updateTokenType = (type: string) => {
  const user = getUser();

  if (user) {
    user.type = type;
    setUser(user);
  }
};

const getLocalRefreshToken = () => {
  const user = getUser();
  return user?.refreshToken;
};

const getLocalAccessToken = () => {
  const user = getUser();
  return user?.accessToken;
};

const updateLocalAccessToken = (token: string) => {
  const user = getUser();

  if (user) {
    user.accessToken = token;
    setUser(user);
  }
};

const getUser = () => {
  const userStr = localStorage.getItem("user");
  let user: User | undefined = undefined;

  if (userStr) user = JSON.parse(userStr);
  return user;
};

const setUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

const removeUser = () => {
  localStorage.removeItem("user");
};

const TokenService = {
  getTokenType,
  updateTokenType,
  getLocalRefreshToken,
  getLocalAccessToken,
  updateLocalAccessToken,
  getUser,
  setUser,
  removeUser,
};

export default TokenService;
