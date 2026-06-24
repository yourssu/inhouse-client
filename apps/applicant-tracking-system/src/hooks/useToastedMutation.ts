import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { useToast } from '@yourssu-inhouse/interior';
import { handleError } from '@/utils/error';

export const useToastedMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  props: UseMutationOptions<TData, TError, TVariables, TContext> & {
    errorText?: string;
    successText: string;
  },
) => {
  const { successText, errorText, ...mutationProps } = props;

  const toast = useToast();
  const mutation = useMutation(mutationProps);

  const mutateWithToast = async (payload: TVariables) => {
    try {
      const result = await mutation.mutateAsync(payload);
      if (successText) {
        toast.success(successText);
      }
      return {
        success: true,
        result,
      } as const;
    } catch (e: unknown) {
      const { type, message } = handleError(e);
      const m = type === 'KyHTTPError' ? await message() : message;
      console.error(errorText ?? m);
      toast.error(errorText ?? m);
      return {
        success: false,
        error: e,
      } as const;
    }
  };

  return { ...mutation, mutateWithToast };
};
