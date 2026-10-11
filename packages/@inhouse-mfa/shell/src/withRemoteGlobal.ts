import type { RemotePlugin } from '@inhouse-mfa/core';
import type { AnyRoute } from '@tanstack/react-router';

import { Outlet } from '@tanstack/react-router';
import { createElement, Fragment } from 'react';

export const withRemoteGlobal = (
  component: AnyRoute['options']['component'],
  global: RemotePlugin['global'],
) => {
  const Component = component || Outlet;
  const Global = global?.Global;

  return Global
    ? () => createElement(Fragment, null, createElement(Global), createElement(Component))
    : Component;
};
