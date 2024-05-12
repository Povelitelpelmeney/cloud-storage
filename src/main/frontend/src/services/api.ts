import axios, { AxiosError } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import eventBus from "../common/eventBus";
import TokenService from "./token-service";

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
  const refreshToken = TokenService.getLocalRefreshToken();
  const response = await instance.post<RefreshTokenResponse>(
    "/api/auth/refresh",
    { token: refreshToken }
  );

  const type = response.data.type;
  const token = response.data.accessToken;
  TokenService.updateTokenType(type);
  TokenService.updateLocalAccessToken(token);

  if (failedRequest.response)
    failedRequest.response.config.headers["authorization"] = `${type} ${token}`;
  return Promise.resolve();
};

createAuthRefreshInterceptor(instance, (failedRequest: AxiosError) =>
  refreshAuthLogic(failedRequest).catch((error: AxiosError<APIError>) => {
    eventBus.dispatch("logout");
    if (error.response?.status === 403) {
      window.alert("Your session has expired. Please make a new login request");
    } else if (error.response?.status === 404) {
      console.error(error.response?.data.message);
    }
  })
);

export default instance;
