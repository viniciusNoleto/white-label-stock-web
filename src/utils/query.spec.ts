import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { createMutation, createQuery } from './query';

describe('createQuery', () => {
  it('fetches on creation and exposes data/isFetching', () => {
    const response$ = new Subject<number>();
    const query = TestBed.runInInjectionContext(() => createQuery({ queryFn: () => response$ }));

    expect(query.isFetching()).toBe(true);

    response$.next(42);
    response$.complete();

    expect(query.data()).toBe(42);
    expect(query.isFetching()).toBe(false);
  });

  it('refetch() cancels the request still in flight', () => {
    let unsubscribed = 0;
    let calls = 0;
    const query = TestBed.runInInjectionContext(() => createQuery({
      queryFn: () => new Observable<number>(() => {
        calls++;
        return () => unsubscribed++;
      }),
    }));

    query.refetch();

    expect(calls).toBe(2);
    expect(unsubscribed).toBe(1);
  });

  it('stores errors and stops fetching', () => {
    const query = TestBed.runInInjectionContext(() => createQuery({ queryFn: () => throwError(() => ({ success: false })) }));

    expect(query.error()).toEqual({ success: false });
    expect(query.isFetching()).toBe(false);
  });

  it('does not fetch when disabled', () => {
    const queryFn = vi.fn(() => of(1));
    TestBed.runInInjectionContext(() => createQuery({ queryFn, enabled: false }));

    expect(queryFn).not.toHaveBeenCalled();
  });
});

describe('createMutation', () => {
  it('calls onSuccess with the response and the variables', () => {
    const onSuccess = vi.fn();
    const mutation = TestBed.runInInjectionContext(() => createMutation({
      mutationFn: (value: number) => of(value * 2),
      onSuccess,
    }));

    mutation.mutate(21);

    expect(onSuccess).toHaveBeenCalledWith(42, 21);
    expect(mutation.isPending()).toBe(false);
  });

  it('keeps isPending while running and calls onError on failure', () => {
    const response$ = new Subject<number>();
    const onError = vi.fn();
    const mutation = TestBed.runInInjectionContext(() => createMutation<number, void>({ mutationFn: () => response$, onError }));

    mutation.mutate();
    expect(mutation.isPending()).toBe(true);

    response$.error('boom');
    expect(mutation.isPending()).toBe(false);
    expect(onError).toHaveBeenCalledWith('boom', undefined);
  });
});
