/**
 * Index Controller
 */

export const getHome = (req, res) => {
  res.json({
    message: "Welcome to Express API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
};
