import React from 'react';
import { vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from './render';

/**
 * Renders a Logic pair (use{Action}LogicData + {Action}LogicComponent) the same way pages do.
 * `latest()` returns the most recent hook result so tests can drive imperative helpers (init/reset/setState).
 */
export function renderLogic<A extends object, R, P extends object>(
  useLogic: (args: A & { onSuccess: () => void }) => R,
  Component: React.ComponentType<P & { logicData: R; onCancel: () => void }>,
  args: A = {} as A,
  props: P = {} as P,
) {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  const show = vi.spyOn(notifications, 'show').mockImplementation(() => '');
  let current: R;

  function Harness() {
    current = useLogic({ ...args, onSuccess });
    return (
      <Component
        {...props}
        logicData={current}
        onCancel={onCancel}
      />
    );
  }

  const utils = renderWithProviders(<Harness />);

  return { ...utils, onSuccess, onCancel, show, latest: () => current! };
}

/** `required` inputs make the browser (and jsdom) block submission natively; submit the form directly to reach Yup. */
export function submitBypassingNativeValidation(container: HTMLElement) {
  fireEvent.submit(container.querySelector('form')!);
}
