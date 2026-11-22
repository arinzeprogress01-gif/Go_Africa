export const healthCheck = (_req, res) => {
  res.status(200).json({
    success: true,
    service: "GreenGig Africa API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
};
