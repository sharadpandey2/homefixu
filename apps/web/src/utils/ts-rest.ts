import { contract } from "@homebuddy-12/api/index";
import { env } from "@homebuddy-12/env/web";
import { QueryClient } from "@tanstack/react-query";
import { initClient, tsRestFetchApi } from "@ts-rest/core";
import { initTsrReactQuery } from "@ts-rest/react-query/v5";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

const clientArgs = {
  baseUrl: `${env.NEXT_PUBLIC_SERVER_URL}/rest`, // Fixed environment variable
  baseHeaders: {},
  credentials: "include" as const,
  api: tsRestFetchApi,
};

const _client = initClient(contract, clientArgs);

export const tsr = initTsrReactQuery(contract, clientArgs);
