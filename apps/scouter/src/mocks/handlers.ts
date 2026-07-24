import { handlers as applicantHandlers } from '@/mocks/applicants';
import { handlers as commentHandlers } from '@/mocks/comments';

export const handlers = [...applicantHandlers, ...commentHandlers];
