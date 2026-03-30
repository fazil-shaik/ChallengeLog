import { Cashfree, CFEnvironment } from "cashfree-pg";

const getEnv = (name: string) => process.env[name]?.replace(/^['"]|['"]$/g, "").trim() || "";

const mode = getEnv("NEXT_PUBLIC_CASHFREE_MODE");
const clientId = getEnv("CASHFREE_CLIENT_ID");
const clientSecret = getEnv("CASHFREE_CLIENT_SECRET");

const cashfree = new Cashfree(
  mode === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  clientId,
  clientSecret
);

export default cashfree;
