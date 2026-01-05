import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { useAutosave } from '../../apps/web/src/hooks/useAutosave.js';

interface TestData {
  value: number;
}

interface TestComponentProps {
  data: TestData;
  delay?: number;
  onSave: (data: TestData) => Promise<void>;
}

function TestComponent({ data, delay = 2000, onSave }: TestComponentProps) {
  const { status } = useAutosave<TestData>(data, onSave, delay);
  return React.createElement('div', { 'data-status': status });
}

describe('Integration - autosave debounce success', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces changes and triggers autosave once with the latest value after delay', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    let renderer: ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(TestComponent, { data: { value: 1 }, onSave }),
      );
    });

    // Update data before debounce delay expires
    await act(async () => {
      renderer!.update(
        React.createElement(TestComponent, { data: { value: 2 }, onSave }),
      );
    });

    // Before debounce window elapses, onSave should not be called
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999);
    });
    expect(onSave).not.toHaveBeenCalled();

    // After crossing the 2000ms threshold, onSave should be called once with latest value
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenLastCalledWith({ value: 2 });
  });

  it('debounces rapid changes and only saves the latest value', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    let renderer: ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(TestComponent, { data: { value: 1 }, onSave }),
      );
    });

    // Update data before debounce delay expires
    await act(async () => {
      renderer!.update(
        React.createElement(TestComponent, { data: { value: 2 }, onSave }),
      );
    });

    // Advance time beyond debounce window
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenLastCalledWith({ value: 2 });
  });
});
