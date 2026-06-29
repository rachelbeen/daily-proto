import { createServer } from "node:http";
import { handleRequest } from "./handler.js";

const port = Number(process.env.PORT ?? 3000);

const server = createServer((req, res) => {
  void handleRequest(req, res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Daily Proto → http://127.0.0.1:${port}`);
  console.log(`Open Data Index → http://127.0.0.1:${port}/open-data`);
});
