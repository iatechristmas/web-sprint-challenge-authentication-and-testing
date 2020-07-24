const request = require("supertest");
const server = require("../api/server");
const db = require("../database/dbConfig");

beforeEach( async () => {
  return db.migrate
    .rollback()
    .then(() => db.migrate.latest())
    .then(() => db.seed.run());
});

test("POST /api/auth/register to be successful", async () => {
  const res = await request(server)
    .post("/api/auth/register")
    .send({ username: "User1", password: "guest" });
  expect(res.status).toBe(201);
});

test("POST /api/auth/register to be unsuccessful when provided with blank username/password or numerical password", async () => {
  const res = await request(server)
    .post("/api/auth/register")
    .send({ password: "guest" });
  expect(res.status).toBe(500);
  expect(res.body).toMatchObject({
    message: {
      errno: 19,
      code: "SQLITE_CONSTRAINT",
    },
  });
});

test("POST /api/auth/login to be successful", async () => {
  const register = await request(server)
    .post("/api/auth/register")
    .send({ username: "User1", password: "guest" });
  const res = await request(server)
    .post("/api/auth/login")
    .send({ username: "User1", password: "guest" });
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({
    message: "Welcome to our API",
  });
  expect(res.body).toHaveProperty("token");
});

test("POST /api/auth/login unsuccessful when provided with invalid password", async () => {
  const register = await request(server)
    .post("/api/auth/register")
    .send({ username: "User1", password: "guest" });
  const res = await request(server)
    .post("/api/auth/login")
    .send({ username: "User1", password: "wrongpassword" });
  expect(res.status).toBe(401);
  expect(res.body).toMatchObject({
    message: "Invalid credentials",
  });
});

test("GET /api/jokes to be successful", async () => {
  const register = await request(server)
    .post("/api/auth/register")
    .send({ username: "User1", password: "guest" });
  const login = await request(server)
    .post("/api/auth/login")
    .send({ username: "User1", password: "guest" });
  console.log(login.body.token);
  const res = await request(server)
    .get("/api/jokes")
    .set("authorization", login.body.token);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("GET /api/jokes to be unsuccessful when login fails", async () => {
  const register = await request(server)
    .post("/api/auth/register")
    .send({ username: "User1", password: "guest" });
  const login = await request(server)
    .post("/api/auth/login")
    .send({ username: "User1", password: "wrongpassword" });
  const res = await request(server).get("/api/jokes");
  expect(res.status).toBe(400);
  expect(res.body).toMatchObject({
    message: "You shall not pass",
  });
});
