import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

export const authHandlers = [
  http.post(`${BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      type: 'Bearer',
      expiresIn: 3600,
    });
  }),

  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'new-fake-access-token',
      refreshToken: 'new-fake-refresh-token',
      type: 'Bearer',
      expiresIn: 3600,
    });
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
