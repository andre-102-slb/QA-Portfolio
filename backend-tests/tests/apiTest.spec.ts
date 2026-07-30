import { beforeAll, describe, expect, it } from "@jest/globals";
import { UserComponent } from "../components/user.component";
import { Mocker } from "../dto/mocker.dto";

describe("API Tests Suite", () => {
  let userComponent: UserComponent;

  beforeAll(async () => {
    userComponent = new UserComponent();
  });
  describe("User API", () => {
    it("should create a user", async () => {
      const createUser = Mocker.user.createUserDto();
      const createUserResponse = await userComponent.createUser(createUser);
      expect(createUserResponse.status).toBe(201);

      const loginUser = await userComponent.login({
        username: process.env.VALID_USER_API!,
        password: process.env.VALID_PASSWORD!,
      });

      expect(loginUser.status).toBe(200);
      const { accessToken: token } = loginUser.body;

      userComponent.setAuthToken(token);

      const getMe = await userComponent.getMe();
      expect(getMe.status).toBe(200);
    });

    it("should create a user with a random custom data", async () => {
      const createUser = Mocker.user.createUserDto({ age: 100 });
      const createUserResponse = await userComponent.createUser(createUser);
      expect(createUserResponse.status).toBe(201);
    });
  });
});
