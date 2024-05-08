import api from "./api";
import TokenService from "./token-service";

const signup = async (request: SignupRequest) => {
  await api.post("/api/auth/signup", request);
};

const login = async (request: LoginRequest) => {
  const response = await api.post<User>("/api/auth/login", request);
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
