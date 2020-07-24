const bcryptjs = require("bcryptjs");
const router = require("express").Router();
const Users = require("./auth-model");

const restricted = require("./authenticate-middleware");

router.get("/", restricted, (req, res) => {
  Users.getAll()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.post("/register", (req, res) => {
  const rounds = process.env.BCRYPT_ROUNDS || 4;
  const hash = bcryptjs.hashSync(req.body.password, rounds);
  req.body.password = hash;
  Users.register(req.body)
    .then((response) => {
      res.status(201).json(response);
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  Users.findByUser({ username })
    .then((users) => {
      const user = users[0];
      if (user && bcryptjs.compareSync(password, user.password)) {
        req.session.loggedIn = true;
        req.session.username = user.username;
        res.status(200).json({ message: "welcome" });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.status(204).end();
  } else {
    res.status(200).json({ message: "already logged out" });
  }
});

module.exports = router;
