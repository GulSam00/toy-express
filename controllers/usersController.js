/**
 * Users Controller
 */

export const getUsers = (req, res) => {
  res.json({
    message: "Users endpoint",
    users: [],
    count: 0,
  });
};
