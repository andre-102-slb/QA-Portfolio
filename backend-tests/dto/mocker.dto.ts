import { UserMocker } from "../mocker/user.mocker";

export class Mocker {
  static user = {
    createUserDto: UserMocker.createUserDto,
  };
}
