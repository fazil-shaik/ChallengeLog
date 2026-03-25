import { Cashfree } from "cashfree-pg";

(Cashfree as any).XClientId = process.env.CASHFREE_CLIENT_ID || "TEST100XXXX";
(Cashfree as any).XClientSecret = process.env.CASHFREE_CLIENT_SECRET || "TESTXXXXXX";
(Cashfree as any).XEnvironment = process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX";

export default Cashfree;
