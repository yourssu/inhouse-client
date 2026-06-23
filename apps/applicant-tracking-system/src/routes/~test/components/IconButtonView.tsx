import { MdAdd } from 'react-icons/md';

import { IconButton } from '@/components/_ui/IconButton';

export const IconButtonView = () => {
  const sizes = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          {sizes.map((size) => (
            <IconButton key={size} size={size}>
              <MdAdd />
            </IconButton>
          ))}
        </div>
        <div className="flex gap-4">
          {sizes.map((size) => (
            <IconButton disabled key={size} size={size}>
              <MdAdd />
            </IconButton>
          ))}
        </div>
        <div className="flex gap-4">
          {sizes.map((size) => (
            <IconButton key={size} size={size} variant="dimmed">
              <MdAdd />
            </IconButton>
          ))}
        </div>
        <div className="flex gap-4">
          {sizes.map((size) => (
            <IconButton disabled key={size} size={size} variant="dimmed">
              <MdAdd />
            </IconButton>
          ))}
        </div>
      </div>
    </>
  );
};
