function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.IDENTITY_PORT ?? 8001),
  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900),
  refreshTokenTtlSeconds: Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 1209600),
  // "Remember me" — a refresh token issued with this TTL instead, when the
  // login form's checkbox is checked. See issueTokenPair.ts.
  rememberMeRefreshTokenTtlSeconds: Number(process.env.REMEMBER_ME_REFRESH_TOKEN_TTL_SECONDS ?? 7776000), // 90 days
};
