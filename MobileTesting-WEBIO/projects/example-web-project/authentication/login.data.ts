export interface LoginCredentials {
  readonly password: string;
  readonly username: string;
}

export const loginData = Object.freeze({
  validUser: {
    username: 'tomsmith',
    password: 'SuperSecretPassword!',
  } satisfies LoginCredentials,
  invalidUser: {
    username: 'tomsmith',
    password: 'incorrect-password',
  } satisfies LoginCredentials,
});
