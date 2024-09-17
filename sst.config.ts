/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "circuit-blog",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const api = await import("./infra/api");

    const { postQueue, emailQueue, dlq } = await import("./infra/queues");

    return {
      api: api.trpc.url,
      postQueue: postQueue.url,
      emailQueue: emailQueue.url,
      dlq: dlq.url,
    };
  },
});
