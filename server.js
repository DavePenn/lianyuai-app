const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  if (pathname === "/") pathname = "/index.html";
  
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || "application/octet-stream";
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      });
      res.end(data);
    }
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Frontend server running on port 3000");
});