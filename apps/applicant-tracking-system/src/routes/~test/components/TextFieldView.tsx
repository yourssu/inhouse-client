import { TextField } from '@/components/_ui/TextField';

export const TextFieldView = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Outline</h2>
        <div className="flex gap-4">
          <TextField placeholder="md" size="md" variant="outline" />
          <TextField invalid placeholder="md invalid" size="md" variant="outline" />
          <TextField disabled placeholder="md disabled" size="md" variant="outline" />
          <TextField
            disabled
            invalid
            placeholder="md disabled invalid"
            size="md"
            variant="outline"
          />
        </div>
        <div className="flex gap-4">
          <TextField placeholder="lg" size="lg" variant="outline" />
          <TextField invalid placeholder="lg invalid" size="lg" variant="outline" />
          <TextField disabled placeholder="lg disabled" size="lg" variant="outline" />
          <TextField
            disabled
            invalid
            placeholder="lg disabled invalid"
            size="lg"
            variant="outline"
          />
        </div>

        <h2 className="mt-8 text-xl font-bold">Dimmed</h2>
        <div className="flex gap-4">
          <TextField placeholder="md" size="md" variant="dimmed" />
          <TextField invalid placeholder="md invalid" size="md" variant="dimmed" />
          <TextField disabled placeholder="md disabled" size="md" variant="dimmed" />
          <TextField
            disabled
            invalid
            placeholder="md disabled invalid"
            size="md"
            variant="dimmed"
          />
        </div>
        <div className="flex gap-4">
          <TextField placeholder="lg" size="lg" variant="dimmed" />
          <TextField invalid placeholder="lg invalid" size="lg" variant="dimmed" />
          <TextField disabled placeholder="lg disabled" size="lg" variant="dimmed" />
          <TextField
            disabled
            invalid
            placeholder="lg disabled invalid"
            size="lg"
            variant="dimmed"
          />
        </div>
      </div>
    </>
  );
};
