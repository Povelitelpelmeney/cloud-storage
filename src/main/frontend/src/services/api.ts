import axios, { AxiosError } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import TokenService from "./token-service";
import eventBus from "../common/eventBus";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((request) => {
  const type = TokenService.getTokenType();
  const token = TokenService.getLocalAccessToken();

  request.headers["authorization"] = `${type} ${token}`;
  return request;
});

const refreshAuthLogic = async (failedRequest: AxiosError) => {
  try {
    const refreshToken = TokenService.getLocalRefreshToken();
    const response = await instance.post<RefreshTokenResponse>(
      "/api/auth/refresh",
      { token: refreshToken }
    );

    const type = response.data.type;
    const token = response.data.accessToken;
    TokenService.updateTokenType(type);
    TokenService.updateLocalAccessToken(token);

    const authHeader = `${type} ${token}`;
    failedRequest.response!.config.headers["authorization"] = authHeader;
  } catch (error: unknown) {
    eventBus.dispatch("logout");
    if (error instanceof AxiosError && error.response?.status === 403)
      window.alert("Your session has expired. Please make a new login request");
    else if (error instanceof AxiosError) {
      console.error(error.response?.data.message || error.response);
    }
  }
};

createAuthRefreshInterceptor(instance, refreshAuthLogic);

export default instance;
