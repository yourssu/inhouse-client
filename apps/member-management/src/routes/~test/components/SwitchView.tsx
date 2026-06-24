import { Switch } from '@yourssu-inhouse/interior';
import { useState } from 'react';

export const SwitchView = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Switch size="sm" />
        <Switch disabled size="sm" />
        <Switch checked={checked} onCheckedChange={setChecked} size="sm" />
      </div>
      <div className="flex gap-4">
        <Switch size="md" />
        <Switch disabled size="md" />
        <Switch checked={checked} onCheckedChange={setChecked} size="md" />
      </div>
      <div className="flex gap-4">
        <Switch size="lg" />
        <Switch disabled size="lg" />
        <Switch checked={checked} onCheckedChange={setChecked} size="lg" />
      </div>
      <div className="flex gap-4">
        <Switch size="xl" />
        <Switch disabled size="xl" />
        <Switch checked={checked} onCheckedChange={setChecked} size="xl" />
      </div>
    </div>
  );
};
