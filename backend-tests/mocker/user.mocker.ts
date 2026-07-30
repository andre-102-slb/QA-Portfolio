import { CreateUserDto } from "../dto/user.dto";
import { faker } from "@faker-js/faker";

export class UserMocker {
  static createUserDto(data?: Partial<CreateUserDto>): CreateUserDto {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 100 }),
      username: faker.internet.email(),
      password: faker.internet.password(),
      ...data,
    };
  }
}
