import { authHandlers } from './auth';
import { cameraHandlers } from './cameras';

export const handlers = [...authHandlers, ...cameraHandlers];
