const User = require("../models/users");

const userMiddleware = {
  verifySession: async (req, res, next) => {
    try {
      if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId).select("-password");
        if (user) {
          const adminEmails = ["admin@fakeso.com"];
          if (adminEmails.includes(user.email)) {
            user.isAdmin = true;
          }
          req.user = user;
          next();
        } else {
          res.status(401).json({ error: "User not found" });
        }
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userMiddleware;
