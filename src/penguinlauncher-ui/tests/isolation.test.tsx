import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe.sequential('test isolation', () => {
  it('rejects unexpected relative requests before they can reach the network', async () => {
    await expect(fetch('/unexpected-test-request')).rejects.toThrow(
      'Unexpected fetch request: /unexpected-test-request',
    );
  });

  it('can temporarily change DOM, fetch, spies, globals, and timers', async () => {
    render(<p>Previous test content</p>);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('{}'));
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.stubGlobal('__frontendIsolationMarker', true);
    vi.useFakeTimers();

    expect(screen.getByText('Previous test content')).toBeInTheDocument();
    expect(await (await fetch('/controlled-test-request')).json()).toEqual({});
    expect(vi.isFakeTimers()).toBe(true);
  });

  it('restores DOM, fetch, spies, globals, and timers for the next test', async () => {
    expect(screen.queryByText('Previous test content')).not.toBeInTheDocument();
    expect(vi.isFakeTimers()).toBe(false);
    expect('__frontendIsolationMarker' in globalThis).toBe(false);
    expect(vi.isMockFunction(console.info)).toBe(false);
    await expect(fetch('/fresh-test-request')).rejects.toThrow(
      'Unexpected fetch request: /fresh-test-request',
    );
  });
});
