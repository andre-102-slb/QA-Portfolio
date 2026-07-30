import request from "supertest";

export class BaseComponent {
  protected app: request.Agent;
  private authToken?: string;

  constructor(baseUrl = process.env.BASE_URL!) {
    this.app = request(baseUrl);
  }

  setAuthToken(token: string) {
    this.authToken = token;
    return this;
  }

  unsetAuthToken() {
    this.authToken = undefined;
    return this;
  }

  toggleOnPasswordAuthentication(authToken: string) {
    return this.setAuthToken(authToken);
  }

  protected authenticate(app: request.Test): request.Test {
    if (this.authToken) {
      return app.auth(this.authToken, { type: "bearer" });
    }
    return app;
  }
}
