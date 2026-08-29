interface CartCookieEnv {
  CART_COOKIE_SECURE?: string;
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

function parseCookieSecureOverride(value: string | undefined) {
  switch (value?.trim().toLowerCase()) {
    case "1":
    case "true":
      return true;
    case "0":
    case "false":
      return false;
    default:
      return undefined;
  }
}

export function shouldUseSecureCartCookie(
  env: CartCookieEnv = process.env
): boolean {
  if (env.VERCEL || env.VERCEL_ENV) {
    return true;
  }

  const override = parseCookieSecureOverride(env.CART_COOKIE_SECURE);
  if (override !== undefined) {
    return override;
  }

  return env.NODE_ENV === "production";
}
