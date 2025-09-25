import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { Client } from "./client";

const Page = async () => {
  const queryClient = getQueryClient();

  // Wait for prefetch to complete before rendering
  await queryClient.prefetchQuery(
    trpc.createAI.queryOptions({ text: "Test prefetch" })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;