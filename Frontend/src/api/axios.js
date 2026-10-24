import axios from "axios";
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let accessToken = null;
let updateReactState = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const attachTokenSync = (callback) => {
  updateReactState = callback;
};

const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});

//send accessToken in header
api.interceptors.request.use(function (config) {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Access token expired" &&
      error.config &&
      !error.config._retry
    ) {
      error.config._retry = true;

      try {
        const response = await axios.get(`${VITE_API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newAccessToken = response.data.accessToken;

        //update accessToken memory
        setAccessToken(newAccessToken);

        if (updateReactState) {
          updateReactState(newAccessToken);
        }

        error.config.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(error.config);
      } catch (refreshError) {
        setAccessToken(null);
        //update Authcontext accessToken
        if (updateReactState) updateReactState(null);
        //redirect to login  page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
