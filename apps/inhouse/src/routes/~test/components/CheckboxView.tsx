import { Checkbox } from '@yourssu-inhouse/interior';

export const CheckboxView = () => {
  return (
    <>
      <div className="flex gap-4">
        <Checkbox />
        <Checkbox checked />
        <Checkbox disabled />
        <Checkbox checked disabled />
      </div>
    </>
  );
};
