const app = require("./app");

const port = process.env.PORT || 3000;
const env = process.env.APP_ENV || "dev";

app.listen(port, () => {
  console.log(`Serveur demarre sur le port ${port} en mode ${env}`);
});
