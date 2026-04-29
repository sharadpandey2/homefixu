import { contract } from "@homebuddy-12/api";
import { initQueryClient } from "@ts-rest/react-query";

export const api = initQueryClient(contract, {
  baseUrl: `${process.env.NEXT_PUBLIC_SERVER_URL ?? "https://server-production-c3c4.up.railway.app"}/api`,
  baseHeaders: {},
  credentials: "include",
});
