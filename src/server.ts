import { createServer } from "node:http";
import { handleRequest } from "./handler.js";

const port = Number(process.env.PORT ?? 3000);

const server = createServer((req, res) => {
  void handleRequest(req, res);
});

server.listen(port, () => {
  console.log(`Daily Proto → http://localhost:${port}`);
});
