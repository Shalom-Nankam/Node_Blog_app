const supertest = require("supertest");
const app = require("../app");
const { connect } = require("./mockDatabase");
const UserModel = require("../users/users.model");

describe("Authentication Tests", () => {
  let connection;
  // before hook
  beforeAll(async () => {
    connection = await connect();
  });

  afterEach(async () => {
    await connection.cleanup();
  });

  // after hook
  afterAll(async () => {
    await connection.disconnect();
  });

  // Test case
  it("should successfully register a user", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .set("content-type", "application/json")
      .send({
        first_name: "Bola",
        last_name: "Tinubu",
        password: "12345678",
        email: "bolatinubu@gmail.com",
      });

    // expectations
    expect(response.status).toEqual(201);
    expect(response.body.data).toMatchObject({
      first_name: "Bola",
      last_name: "Tinubu",
      email: "bolatinubu@gmail.com",
      password: expect.any(String),
      _id: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
      __v: expect.any(Number),
    });
  });

  // Test case
  it("should successfully login a user", async () => {
    await UserModel.create({
      first_name: "Bola",
      last_name: "Tinubu",
      password: "12345678",
      email: "bolatinubu@gmail.com",
    });

    const response = await supertest(app)
      .post("/user/login")
      .set("content-type", "application/json")
      .send({
        email: "bolatinubu@gmail.com",
        password: "12345678",
      });

    // expectations
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      message: "Logged in successfully",
      token: expect.any(String),
      user: expect.any(Object),
    });

    expect(response.body.user.first_name).toEqual("Bola");
    expect(response.body.user.email).toEqual("bolatinubu@gmail.com");
  });

  it("should not successfully login a user, when user does not exist", async () => {
    await UserModel.create({
      first_name: "Bola",
      last_name: "Tinubu",
      password: "12345678",
      email: "bolatinubu@gmail.com",
    });

    const response = await supertest(app)
      .post("/user/login")
      .set("content-type", "application/json")
      .send({
        email: "kashimshettima@gmail.com",
        password: "12345678",
      });

    // expectations
    expect(response.status).toEqual(422);
    expect(response.body).toMatchObject({
      message: "User not found",
    });
  });
});
