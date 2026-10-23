import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebouncedEffect, useNotFirstEffect, usePageTitle, useStoppableEffect } from '@/utils/hooks';

describe('usePageTitle', () => {
  it('sets the title with the brand suffix and restores it on unmount', () => {
    document.title = 'Antes';

    const { unmount } = renderHook(() => usePageTitle('Itens', 'Inventário'));
    expect(document.title).toBe('Itens | Inventário | StockFlow');

    unmount();
    expect(document.title).toBe('Antes');
  });
});

describe('useNotFirstEffect', () => {
  it('skips the first run and fires on dependency changes', () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ dep }) => useNotFirstEffect(effect, [dep]), { initialProps: { dep: 1 } });
    expect(effect).not.toHaveBeenCalled();

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(1);
  });
});

describe('useDebouncedEffect', () => {
  it('debounces calls after the first render', () => {
    vi.useFakeTimers();
    const effect = vi.fn();

    const { rerender } = renderHook(({ dep }) => useDebouncedEffect(effect, [dep], 500), { initialProps: { dep: 'a' } });
    rerender({ dep: 'ab' });
    rerender({ dep: 'abc' });

    act(() => { vi.advanceTimersByTime(499); });
    expect(effect).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(effect).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

describe('useStoppableEffect', () => {
  it('runs until stop is called', () => {
    const effect = vi.fn();

    const { result, rerender } = renderHook(({ dep }) => useStoppableEffect(effect, [dep]), { initialProps: { dep: 1 } });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(2);

    result.current();
    rerender({ dep: 3 });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
