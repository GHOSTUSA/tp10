const express = require("express");
const client = require("prom-client");
const app = express();

const env = process.env.APP_ENV || "dev";

let counter = 0;

// Registre Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const errorCounter = new client.Counter({
  name: "http_errors_total",
  help: "Total number of HTTP errors",
});

register.registerMetric(requestCounter);
register.registerMetric(errorCounter);

// Middleware de logging simple
app.use((req, res, next) => {
  res.on("finish", () => {
    if (req.path !== "/metrics") {
      requestCounter.inc({
        method: req.method,
        route: req.path,
        status_code: String(res.statusCode),
      });
    }
  });

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - Env: ${env}`,
  );
  next();
});

app.get("/", (req, res) => {
  counter++;
  res.json({
    message: "Bienvenue sur l'API",
    env: env,
    counter: counter,
  });
});

app.get("/error", (req, res) => {
  errorCounter.inc();
  res.status(500).json({ error: "Une erreur simulée s'est produite" });
});

// Endpoint Prometheus
app.get("/metrics", (req, res) => {
  res.set("Content-Type", register.contentType);
  register.metrics().then((metrics) => res.end(metrics));
});

module.exports = app;
