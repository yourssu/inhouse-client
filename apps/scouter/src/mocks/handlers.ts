import { handlers as applicantHandlers } from '@/mocks/applicants';
import { handlers as commentHandlers } from '@/mocks/comments';
import { handlers as partHandlers } from '@/mocks/parts';

export const handlers = [...applicantHandlers, ...commentHandlers, ...partHandlers];
