import api from "./api";
import TokenService from "./token-service";

const baseURI = "/api/auth";

const signup = async (request: SignupRequest) => {
  await api.post(`${baseURI}/signup`, request);
};

const login = async (request: LoginRequest) => {
  const response = await api.post<User>(`${baseURI}/login`, request);
  const user = response.data;

  if (user.accessToken) TokenService.setUser(user);
};

const logout = () => {
  TokenService.removeUser();
};

const AuthService = {
  signup,
  login,
  logout,
};

export default AuthService;
