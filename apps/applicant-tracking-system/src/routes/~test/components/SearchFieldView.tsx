import { SearchField } from '@/components/_ui/SearchField';

export const SearchFieldView = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <SearchField className="w-full" placeholder="md dimmed" size="md" variant="dimmed" />
        <SearchField className="w-full" placeholder="lg dimmed" size="lg" variant="dimmed" />
      </div>
      <div className="flex gap-4">
        <SearchField className="w-full" placeholder="md outline" size="md" variant="outline" />
        <SearchField className="w-full" placeholder="lg outline" size="lg" variant="outline" />
      </div>
      <div className="flex gap-4">
        <SearchField
          className="w-full"
          defaultValue="deleteable"
          onDeleteClick={() => {}}
          placeholder="md dimmed deleteable"
          size="md"
          variant="dimmed"
        />
        <SearchField
          className="w-full"
          defaultValue="deleteable"
          onDeleteClick={() => {}}
          placeholder="lg dimmed deleteable"
          size="lg"
          variant="dimmed"
        />
      </div>
      <div className="flex gap-4">
        <SearchField
          className="w-full"
          defaultValue="deleteable"
          onDeleteClick={() => {}}
          placeholder="md outline deleteable"
          size="md"
          variant="outline"
        />
        <SearchField
          className="w-full"
          defaultValue="deleteable"
          onDeleteClick={() => {}}
          placeholder="lg outline deleteable"
          size="lg"
          variant="outline"
        />
      </div>
    </div>
  );
};
