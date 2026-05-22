export const MAX_CART_MUTATION_BODY_BYTES = 1024;

export type CartMutationPolicyRejection =
  | "unsupported-media-type"
  | "payload-too-large";

export type CartJsonBodyResult =
  | { status: "ok"; value: unknown }
  | { status: "invalid-json" }
  | { status: "payload-too-large" };

interface HeaderReader {
  get(name: string): string | null;
}

interface CartCookieEnv {
  CART_COOKIE_SECURE?: string;
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

function isJsonMediaType(contentType: string | null) {
  if (!contentType) {
    return false;
  }

  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json" || mediaType.endsWith("+json");
}

function cartBodyExceedsLimit(contentLength: string | null) {
  if (!contentLength || !/^\d+$/.test(contentLength)) {
    return false;
  }

  return Number(contentLength) > MAX_CART_MUTATION_BODY_BYTES;
}

export function getCartMutationPolicyRejection(
  headers: HeaderReader
): CartMutationPolicyRejection | null {
  if (!isJsonMediaType(headers.get("content-type"))) {
    return "unsupported-media-type";
  }

  if (cartBodyExceedsLimit(headers.get("content-length"))) {
    return "payload-too-large";
  }

  return null;
}

export async function readCartJsonBody(
  request: Request
): Promise<CartJsonBodyResult> {
  if (!request.body) {
    return { status: "invalid-json" };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }

    byteLength += chunk.value.byteLength;
    if (byteLength > MAX_CART_MUTATION_BODY_BYTES) {
      await reader.cancel();
      return { status: "payload-too-large" };
    }

    text += decoder.decode(chunk.value, { stream: true });
  }

  text += decoder.decode();

  try {
    return { status: "ok", value: JSON.parse(text) };
  } catch {
    return { status: "invalid-json" };
  }
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
