export const SESSION_COOKIE = "nc_session";

export const setSession = (username: string) => {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(username)}; path=/; max-age=86400`;
};

export const clearSession = () => {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
};
