const db = require("../database/dbConfig");

module.exports = {
  getAll,
  register,
  findBy,
  login,
  findByUser,
};

function getAll() {
  return db("users");
}

function findBy(id) {
  return db("users").where({ id });
}

function register(user) {
  return db("users")
    .insert(user, "id")
    .then((id) => {
      return findBy(id[0]);
    });
}

function login(user) {
  return db("users");
}

function findByUser(filter) {
  return db("users").where(filter).orderBy("id");
}
