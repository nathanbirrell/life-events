import { writeFile } from "fs/promises";
import { getLoggingConfiguration } from "@ogcio/fastify-logging-wrapper";
import { build } from "./app";

const app = await build(getLoggingConfiguration());

app.listen({ host: "0.0.0.0", port: 8009 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`app listening at ${address}`);
});

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
