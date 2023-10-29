const supertest = require("supertest");
const app = require("../app");
const { connect } = require("./mockDatabase");
const ArticleModel = require("../articles/article.model");
const UserModel = require("../users/users.model");

// Test suite
describe("Blog Tests", () => {
  let connection;
  let token;
  // before hook
  beforeAll(async () => {
    connection = await connect();
  });

  beforeEach(async () => {
    // create a user
    const user = await UserModel.create({
      first_name: "Bola",
      last_name: "Tinubu",
      password: "12345678",
      email: "bolatinubu@gmail.com",
    });

    // Create blogs

    const blogs = await ArticleModel.create([
      {
        title: "Our first Blog title",
        description: "Our first Blog description",
        tags: "#ourfirsttag #ourfirsttagtoo",
        body: "Our first blog body",
        author: user._id,
        state: "Draft",
      },
      {
        title: "Our second Blog title",
        description: "Our second Blog description",
        tags: "#oursecondtag #oursecondtagtoo",
        body: "Our second blog body",
        author: user._id,
        state: "Draft",
      },
      {
        title: "Our third Blog title",
        description: "Our third Blog description",
        tags: "#ourthirdtag #ourthirdtagtoo",
        body: "Our third blog body",
        author: user._id,
        state: "Published",
      },
      {
        title: "Our fourth Blog title",
        description: "Our fourth Blog description",
        tags: "#ourfourthtag #ourfourthtagtoo",
        body: "Our fourth blog body",
        author: user._id,
        state: "Published",
      },
      {
        title: "Our fifth Blog title",
        description: "Our fifth Blog description",
        tags: "#ourfifthtag #ourfifthtagtoo",
        body: "Our fifth blog body",
        author: user._id,
        state: "Draft",
      },
      {
        title: "Our sixth Blog title",
        description: "Our sixth Blog description",
        tags: "#oursixthtag #oursixthtagtoo",
        body: "Our sixth blog body",
        author: user._id,
        state: "Draft",
      },
    ]);

    // login that user
    const response = await supertest(app)
      .post("/user/login")
      .set("content-type", "application/json")
      .send({
        email: "bolatinubu@gmail.com",
        password: "12345678",
      });

    // store the token in a global object
    token = response.body.token;
  });

  afterEach(async () => {
    await connection.cleanup();
  });

  // after hook
  afterAll(async () => {
    await connection.disconnect();
  });

  // test case
  it("should return a list of blogs", async () => {
    const response = await supertest(app)
      .get("/blogs")
      .set("content-type", "application/json");

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      data: expect.any(Object),
      message: "Blogs fetched successfully",
    });
  });

  //   should error because no token
  it("should return unauthorized error", async () => {
    const response = await supertest(app)
      .post("/blogs/user/create")
      .set("content-type", "application/json")
      .send({
        title: "Our wrong Blog title",
        description: "Our wrong Blog description",
        tags: "#ourwrongtag #ourwrongtagtoo",
        body: "Our wrong blog body",
        author: "po098iu7",
        state: "Draft",
      });

    expect(response.status).toEqual(401);
  });

  it("should return a list of searched blogs", async () => {
    const response = await supertest(app)
      .post("/blogs/search")
      .set("content-type", "application/json")
      .send({
        search_term: "third",
        filter: "Published",
        is_user_blog: "false",
        sorter: "read_count",
        order: "asc",
      });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      data: expect.any(Object),
      message: "Blogs searched successfully",
    });
  });

  //   should fail since we wrong blog _id
  it("should return fail to edit blog", async () => {
    const response = await supertest(app)
      .post("/blogs/user/edit")
      .set("content-type", "application/json")
      .set("authorization", `Bearer ${token}`)
      .send({
        _id: "po09i8u7y6",
        title: "Our second Blog title",
        description: "Our edited Blog description",
        tags: "#oursecondtag #oursecondtagtoo",
        body: "Our second blog body",
        state: "Draft",
      });

    expect(response.status).toEqual(404);
    expect(response.body).toMatchObject({
      message: "Could not find blog to update",
      data: null,
    });
  });
});
