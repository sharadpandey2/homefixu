const http = require("node:http");
http.get("http://localhost:3000/api/technician/signup", (res) => {
  console.log("Status Code:", res.statusCode);
});
