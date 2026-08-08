export const SESSION_COOKIE = "rims_access_token";
export const REFRESH_COOKIE = "rims_refresh_token";
/** Not a secret — just mirrors the refresh cookie's persistence choice so later actions (switch/create restaurant) can echo it back without re-deriving it. */
export const REMEMBER_ME_COOKIE = "rims_remember_me";
