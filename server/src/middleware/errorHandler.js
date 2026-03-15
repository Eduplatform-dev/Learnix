export const notFound = (req, res, _next) => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  const status = Number(err?.statusCode || err?.status || 500);
  const message = err?.message || "Internal server error";

  res.status(status).json({ error: message });
};