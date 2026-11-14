export type Sessao = {
  token: string;
  /** Data/hora de expiração em ISO-8601. */
  expiraEm: string;
  email: string;
};
