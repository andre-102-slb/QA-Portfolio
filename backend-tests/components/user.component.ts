import { CreateUserDto, LoginUserDto } from "../dto/user.dto";
import { BaseComponent } from "./auth.component";

export class UserComponent extends BaseComponent {
  static baseURL = "/user";
  static endpoint = {
    create: `${this.baseURL}/add`,
    get: (id: string) => `${this.baseURL}/${id}`,
    login: `${this.baseURL}/login`,
    getMe: `${this.baseURL}/me`,
  };

  async createUser(user: CreateUserDto) {
    return await this.authenticate(
      this.app.post(UserComponent.endpoint.create).send(user),
    );
  }

  async getMe(query: Record<string, any> = {}) {
    return await this.authenticate(
      this.app.get(UserComponent.endpoint.getMe).query(query),
    );
  }

  async login(user: LoginUserDto) {
    return await this.authenticate(
      this.app.post(UserComponent.endpoint.login).send(user),
    );
  }
}
