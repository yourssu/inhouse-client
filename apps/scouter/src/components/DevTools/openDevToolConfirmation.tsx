import { overlay } from 'overlay-kit';

import {
  DevToolConfirmationDialog,
  type DevToolConfirmationOptions,
} from './DevToolConfirmationDialog';

export const openDevToolConfirmation = async (options: DevToolConfirmationOptions) =>
  await overlay.openAsync<boolean>(({ close, isOpen }) => (
    <DevToolConfirmationDialog {...options} close={close} isOpen={isOpen} />
  ));
