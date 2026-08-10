import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge, Button, Popover, TextField } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { MdAdd, MdKeyboardArrowDown } from 'react-icons/md';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';

import { updateInterviewRequirementsMutationOptions } from '@/apis/interviews/requirements/query';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import {
  type RequirementColor,
  requirementGroupConfigs,
  requirementOptionClassNames,
  type TeamJobOtherRequirementCategory,
  teamJobOtherRequirementGroupConfigs,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/requirementOptions';

interface RequirementsEditorProps {
  partId: number;
  requirements: InterviewRequirements;
  semester: string;
  usedRequirementIds: ReadonlySet<number>;
}

type SaveRequirements = (requirements: InterviewRequirements) => Promise<boolean>;

export const RequirementsEditor = ({
  partId,
  requirements,
  semester,
  usedRequirementIds,
}: RequirementsEditorProps) => {
  const { isPending, mutateWithToast } = useToastedMutation({
    ...updateInterviewRequirementsMutationOptions,
    successText: '요구조건을 저장했어요.',
  });
  const requirementCount = requirementGroupConfigs.reduce(
    (count, config) => count + requirements[config.key].length,
    0,
  );

  const handleSave: SaveRequirements = async (requirements) => {
    const { success } = await mutateWithToast({
      partId,
      semester,
      data: requirements,
    });
    return success;
  };

  return (
    <section aria-labelledby="requirement-editor-heading">
      <Collapsible.Root className="flex flex-col gap-2">
        <h3 id="requirement-editor-heading">
          <Collapsible.Trigger asChild>
            <button
              className="group hover:bg-greyOpacity50 focus-visible:outline-violet500 rounded-10 flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold">요구조건</span>
                <Badge color="grey" size="sm">
                  {requirementCount}개
                </Badge>
              </span>
              <MdKeyboardArrowDown
                aria-hidden
                className="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            </button>
          </Collapsible.Trigger>
        </h3>

        <Collapsible.Content>
          <div className="flex flex-col gap-3">
            <ReadOnlyRequirementGroup requirements={requirements} />

            {teamJobOtherRequirementGroupConfigs.map((config) => (
              <EditableRequirementGroup
                color={config.color}
                isSaving={isPending}
                key={config.key}
                label={config.label}
                name={config.key}
                onSave={handleSave}
                placeholder={config.placeholder}
                requirements={requirements}
                usedRequirementIds={usedRequirementIds}
              />
            ))}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </section>
  );
};

interface EditableRequirementGroupProps {
  color: RequirementColor;
  isSaving: boolean;
  label: string;
  name: TeamJobOtherRequirementCategory;
  onSave: SaveRequirements;
  placeholder: string;
  requirements: InterviewRequirements;
  usedRequirementIds: ReadonlySet<number>;
}

/**
 * Team fit, Job fit, 기타 중 한 분류의 요구조건을 추가·수정·삭제한다.
 */
const EditableRequirementGroup = ({
  color,
  isSaving,
  label,
  name,
  onSave,
  placeholder,
  requirements,
  usedRequirementIds,
}: EditableRequirementGroupProps) => {
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const { control, handleSubmit, reset } = useForm<EditableRequirementFormValues>({
    defaultValues: { content: '' },
    mode: 'onChange',
  });
  const requirementsForCategory = requirements[name];

  const handleAddPopoverOpenChange = (isOpen: boolean) => {
    setIsAddPopoverOpen(isOpen);
    reset({ content: '' });
  };

  const handleAdd: SubmitHandler<EditableRequirementFormValues> = async ({ content }) => {
    if (isSaving) {
      return;
    }

    const isSaved = await onSave({
      ...requirements,
      [name]: [...requirementsForCategory, { content: content.trim() }],
    });

    if (isSaved) {
      setIsAddPopoverOpen(false);
      reset({ content: '' });
    }
  };

  const handleChange = (index: number, content: string) =>
    onSave({
      ...requirements,
      [name]: requirementsForCategory.map((requirement, requirementIndex) =>
        requirementIndex === index ? { ...requirement, content } : requirement,
      ),
    });

  const handleDelete = (index: number) =>
    onSave({
      ...requirements,
      [name]: requirementsForCategory.filter((_, requirementIndex) => requirementIndex !== index),
    });

  return (
    <div className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border px-4 py-3">
      <div className="flex items-center gap-1.5">
        <h4 className="text-13 text-neutralMuted font-medium">{label}</h4>
        <span className="text-neutralSubtle text-xs">{requirementsForCategory.length}</span>
      </div>

      {requirementsForCategory.length === 0 ? (
        <p className="text-neutralSubtle text-xs">등록된 요구조건이 없어요.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {requirementsForCategory.map((requirement, index) => (
            <EditableRequirementOption
              color={color}
              content={requirement.content}
              isDeleteDisabled={
                requirement.id !== undefined && usedRequirementIds.has(requirement.id)
              }
              isSaving={isSaving}
              key={requirement.id ?? `${name}-${index}`}
              label={label}
              onChange={(content) => handleChange(index, content)}
              onDelete={() => handleDelete(index)}
              placeholder={placeholder}
            />
          ))}
        </div>
      )}

      <Popover onOpenChange={handleAddPopoverOpenChange} open={isAddPopoverOpen}>
        <Popover.Trigger>
          <Button
            className="text-violet600 w-fit"
            disabled={isSaving}
            left={<MdAdd aria-hidden className="size-3.5" />}
            size="xs"
            type="button"
            variant="transparent"
          >
            요구조건 추가
          </Button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-72">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit(handleAdd)}>
            <Controller
              control={control}
              name="content"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    aria-invalid={fieldState.invalid}
                    aria-label={`${label} 새 요구조건`}
                    autoFocus
                    invalid={fieldState.invalid}
                    label={`${label} 요구조건`}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    placeholder={placeholder}
                    size="md"
                    value={field.value}
                    variant="outline"
                  />

                  {fieldState.error?.message !== undefined && (
                    <p className="text-13 text-red600" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      disabled={isSaving}
                      onClick={() => handleAddPopoverOpenChange(false)}
                      size="xs"
                      type="button"
                      variant="secondary"
                    >
                      취소
                    </Button>
                    <Button
                      disabled={!fieldState.isDirty || fieldState.invalid || isSaving}
                      loading={isSaving}
                      size="xs"
                      type="submit"
                    >
                      추가
                    </Button>
                  </div>
                </>
              )}
              rules={{
                required: `요구조건을 입력해 주세요.`,
              }}
            />
          </form>
        </Popover.Content>
      </Popover>
    </div>
  );
};

interface EditableRequirementOptionProps {
  color: RequirementColor;
  content: string;
  isDeleteDisabled: boolean;
  isSaving: boolean;
  label: string;
  onChange: (content: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  placeholder: string;
}

interface EditableRequirementFormValues {
  content: string;
}

/**
 * 요구조건 하나를 표시하고, 클릭하면 수정·삭제 팝오버를 연다.
 */
const EditableRequirementOption = ({
  color,
  content,
  isDeleteDisabled,
  isSaving,
  label,
  onChange,
  onDelete,
  placeholder,
}: EditableRequirementOptionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { control, handleSubmit, reset } = useForm<EditableRequirementFormValues>({
    defaultValues: { content },
    mode: 'onChange',
  });

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);

    if (isOpen) {
      reset({ content });
    }
  };

  const handleChange: SubmitHandler<EditableRequirementFormValues> = async ({ content }) => {
    const isSaved = await onChange(content.trim());

    if (isSaved) {
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    const isSaved = await onDelete();

    if (isSaved) {
      setIsOpen(false);
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange} open={isOpen}>
      <Popover.Trigger>
        <button
          aria-label={`${label} 요구조건 '${content}' 편집`}
          className={`focus-visible:outline-violet500 inline-flex h-5 w-fit cursor-pointer items-center rounded-full px-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${requirementOptionClassNames[color]}`}
          disabled={isSaving}
          type="button"
        >
          {content}
        </button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-72">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(handleChange)}>
          <Controller
            control={control}
            name="content"
            render={({ field, fieldState }) => (
              <>
                <TextField
                  aria-invalid={fieldState.invalid}
                  aria-label={`${label} 요구조건 수정`}
                  autoFocus
                  invalid={fieldState.invalid}
                  label={`${label} 요구조건`}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder={placeholder}
                  size="md"
                  value={field.value}
                  variant="outline"
                />

                {fieldState.error?.message !== undefined && (
                  <p className="text-13 text-red600" role="alert">
                    {fieldState.error.message}
                  </p>
                )}

                {isDeleteDisabled && (
                  <p className="text-13 text-neutralSubtle">
                    질문에 할당된 요구조건은 삭제할 수 없어요.
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    disabled={isDeleteDisabled || isSaving}
                    loading={isSaving}
                    onClick={handleDelete}
                    size="xs"
                    type="button"
                    variant="secondary"
                  >
                    삭제
                  </Button>
                  <Button
                    disabled={!fieldState.isDirty || fieldState.invalid || isSaving}
                    loading={isSaving}
                    size="xs"
                    type="submit"
                  >
                    수정
                  </Button>
                </div>
              </>
            )}
            rules={{
              required: `요구조건을 입력해 주세요.`,
            }}
          />
        </form>
      </Popover.Content>
    </Popover>
  );
};

/** Culture fit 요구조건 */
const ReadOnlyRequirementGroup = ({ requirements }: { requirements: InterviewRequirements }) => {
  const config = requirementGroupConfigs[0];

  return (
    <div className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border px-4 py-3">
      <div className="flex items-center gap-1.5">
        <h4 className="text-13 text-neutralMuted font-medium">{config.label}</h4>
        <span className="text-neutralSubtle text-xs">{requirements.culture.length}</span>
        <Badge color="grey" size="xs">
          HR 관리
        </Badge>
      </div>
      {requirements.culture.length === 0 ? (
        <p className="text-neutralSubtle text-xs">등록된 요구조건이 없어요.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {requirements.culture.map((requirement) => (
            <Badge
              color={config.color}
              key={`${requirement.id ?? 'without-id'}-${requirement.content}`}
              size="sm"
            >
              {requirement.content}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
