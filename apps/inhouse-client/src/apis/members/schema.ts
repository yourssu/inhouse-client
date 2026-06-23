import { z } from 'zod/v4';

export const partNames = [
  'Head Lead',
  'Finance',
  'HR',
  'Marketing',
  'Legal',
  'PM',
  'Backend',
  'Android',
  'iOS',
  'Frontend',
  'Product Design',
] as const;

export const partNameSchema = z.enum(partNames);
export type PartName = z.infer<typeof partNameSchema>;

export const memberStates = ['active', 'inactive', 'completed', 'withdrawn'] as const;
export const memberStateSchema = z.enum(memberStates);
export type MemberState = z.infer<typeof memberStateSchema>;

export const memberPositions = ['LEAD', 'VICELEAD', 'MEMBER'] as const;
export const memberPositionSchema = z.enum(memberPositions);
export type MemberPosition = z.infer<typeof memberPositionSchema>;

export const memberSchema = z
  .object({
    memberId: z.number(),
    partNames: z.array(partNameSchema),
    position: memberPositionSchema,
    name: z.string(),
    nickname: z.string(),
    nicknameKo: z.string(),
    state: memberStateSchema,
    email: z.string().email(),
    phoneNumber: z.string().regex(/^010-\d{4}-\d{4}$/),
    department: z.string(),
    studentId: z.string().regex(/^\d{8}$/),
    birthDate: z.iso.date(),
    joinSemester: z.string().regex(/^\d{2}-[12]$/),
    note: z.string(),
    history: z.array(z.record(z.string(), memberStateSchema)),
    isOnLeave: z.boolean().nullable(),
    grade: z.number().int().min(1).max(5).nullable(),
    isDuesPaid: z.boolean().nullable(),
    inactiveReason: z.string().nullable(),
    expectedReturnSemester: z
      .string()
      .regex(/^\d{2}-[12]$/)
      .nullable(),
    completedSemester: z
      .string()
      .regex(/^\d{2}-[12]$/)
      .nullable(),
    withdrawnSemester: z
      .string()
      .regex(/^\d{2}-[12]$/)
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.state === 'active') {
      if (data.isOnLeave === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'isOnLeave must not be null when state is active',
          path: ['isOnLeave'],
        });
      }
      if (data.grade === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'grade must not be null when state is active',
          path: ['grade'],
        });
      }
      if (data.isDuesPaid === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'isDuesPaid must not be null when state is active',
          path: ['isDuesPaid'],
        });
      }
    } else {
      if (data.isOnLeave !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'isOnLeave must be null when state is not active',
          path: ['isOnLeave'],
        });
      }
      if (data.grade !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'grade must be null when state is not active',
          path: ['grade'],
        });
      }
      if (data.isDuesPaid !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'isDuesPaid must be null when state is not active',
          path: ['isDuesPaid'],
        });
      }
    }

    if (data.state === 'inactive') {
      if (data.inactiveReason === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'inactiveReason must not be null when state is inactive',
          path: ['inactiveReason'],
        });
      }
      if (data.expectedReturnSemester === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'expectedReturnSemester must not be null when state is inactive',
          path: ['expectedReturnSemester'],
        });
      }
    } else {
      if (data.inactiveReason !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'inactiveReason must be null when state is not inactive',
          path: ['inactiveReason'],
        });
      }
      if (data.expectedReturnSemester !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'expectedReturnSemester must be null when state is not inactive',
          path: ['expectedReturnSemester'],
        });
      }
    }

    if (data.state === 'completed') {
      if (data.completedSemester === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'completedSemester must not be null when state is completed',
          path: ['completedSemester'],
        });
      }
    } else {
      if (data.completedSemester !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'completedSemester must be null when state is not completed',
          path: ['completedSemester'],
        });
      }
    }

    if (data.state === 'withdrawn') {
      if (data.withdrawnSemester === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'withdrawnSemester must not be null when state is withdrawn',
          path: ['withdrawnSemester'],
        });
      }
    } else {
      if (data.withdrawnSemester !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'withdrawnSemester must be null when state is not withdrawn',
          path: ['withdrawnSemester'],
        });
      }
    }
  });

export type Member = z.infer<typeof memberSchema>;

export const memberListSchema = z.array(memberSchema);
export type MemberList = z.infer<typeof memberListSchema>;

export const paginatedMembersSchema = z.object({
  items: z.array(memberSchema),
  totalCount: z.number(),
  totalPages: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type PaginatedMembers = z.infer<typeof paginatedMembersSchema>;

export const semesterSchema = z.string().regex(/^\d{2}-[12]$/);
export type Semester = z.infer<typeof semesterSchema>;

export const semesterListSchema = z.array(semesterSchema);
export type SemesterList = z.infer<typeof semesterListSchema>;

export const partListSchema = z.array(partNameSchema);
export type PartList = z.infer<typeof partListSchema>;
