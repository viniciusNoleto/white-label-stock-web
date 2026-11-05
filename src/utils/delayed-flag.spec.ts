import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { delayedFlag } from './delayed-flag';

describe('delayedFlag', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const source = signal(false);
    const flag = TestBed.runInInjectionContext(() => delayedFlag(source, { delay: 400, minDuration: 700 }));
    const set = (value: boolean) => {
      source.set(value);
      TestBed.tick();
    };

    TestBed.tick();

    return { flag, set };
  }

  it('never turns on when the source is shorter than the delay', () => {
    const { flag, set } = setup();

    set(true);
    vi.advanceTimersByTime(300);
    set(false);
    vi.advanceTimersByTime(1000);

    expect(flag()).toBe(false);
  });

  it('turns on after the delay and stays on for the minimum duration', () => {
    const { flag, set } = setup();

    set(true);
    vi.advanceTimersByTime(400);

    expect(flag()).toBe(true);

    vi.advanceTimersByTime(100);
    set(false);

    expect(flag()).toBe(true);

    vi.advanceTimersByTime(600);

    expect(flag()).toBe(false);
  });
});
