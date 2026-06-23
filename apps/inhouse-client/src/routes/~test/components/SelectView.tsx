import { Select } from '@yourssu-inhouse/interior';

export const SelectView = () => {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="xs"
              value="a"
              variant="dimmed"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="sm"
              value="a"
              variant="dimmed"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="md"
              value="a"
              variant="dimmed"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="lg"
              value="a"
              variant="dimmed"
            />
          </div>
          <div className="flex gap-4">
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="xs"
              value="a"
              variant="dimmed"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="sm"
              value="a"
              variant="dimmed"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="md"
              value="a"
              variant="dimmed"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="lg"
              value="a"
              variant="dimmed"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="xs"
              value="a"
              variant="outline"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="sm"
              value="a"
              variant="outline"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="md"
              value="a"
              variant="outline"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="lg"
              value="a"
              variant="outline"
            />
          </div>
          <div className="flex gap-4">
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="xs"
              value="a"
              variant="outline"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="sm"
              value="a"
              variant="outline"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="md"
              value="a"
              variant="outline"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="lg"
              value="a"
              variant="outline"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="xs"
              value="a"
              variant="inline"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="sm"
              value="a"
              variant="inline"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="md"
              value="a"
              variant="inline"
            />
            <Select
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="lg"
              value="a"
              variant="inline"
            />
          </div>
          <div className="flex gap-4">
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="xs"
              value="a"
              variant="inline"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="sm"
              value="a"
              variant="inline"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="md"
              value="a"
              variant="inline"
            />
            <Select
              disabled
              items={['a', 'b', 'c']}
              onValueChange={() => {}}
              placeholder=""
              size="lg"
              value="a"
              variant="inline"
            />
          </div>
        </div>
      </div>
    </>
  );
};
