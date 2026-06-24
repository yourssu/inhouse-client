import { Button } from '@/components/_ui/Button';
import { useToast } from '@yourssu-inhouse/interior';

export const ToastView = () => {
  const toast = useToast();

  return (
    <>
      <div className="flex gap-4">
        <Button onClick={() => toast.success('test')} size="md" variant="primary">
          Success
        </Button>
        <Button onClick={() => toast.error('test')} size="md" variant="secondary">
          Error
        </Button>
        <Button onClick={() => toast.default('test')} size="md" variant="subPrimary">
          Default
        </Button>
      </div>
    </>
  );
};
