import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountSelectorModal } from '../../src/components/AccountSelectorModal';
import type { Account, ConflictInfo } from '../../src/types';

const alice: Account = {
  id: 'account-a',
  displayName: 'Alice',
  platform: 'Steam',
  platformUserId: 'synthetic-alice',
  isActive: true,
  sessionBackupPath: null,
  lastLogin: null,
};
const bob: Account = {
  id: 'account-b',
  displayName: 'Bob',
  platform: 'Steam',
  platformUserId: 'synthetic-bob',
  isActive: false,
  sessionBackupPath: null,
  lastLogin: null,
};
const conflict: ConflictInfo = {
  gameId: 'game-a',
  gameName: 'Synthetic Game',
  availableAccounts: [alice, bob],
};

describe('AccountSelectorModal', () => {
  it('uses a flat scrollable conflict surface and keeps Escape cancellation', () => {
    const onCancel = vi.fn();
    render(<AccountSelectorModal conflict={conflict} onSelect={vi.fn()} onCancel={onCancel} />);
    const dialog = screen.getByRole('dialog', { name: 'Account Conflict Resolution' });
    expect(dialog).toHaveClass('bg-card', 'border-border', 'overflow-y-auto');
    expect(dialog.innerHTML).not.toMatch(/backdrop-blur|bg-gradient|shadow-md|rounded-xl/);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledExactlyOnceWith();
  });
  it('lists both profiles and selects Bob once through Switch & Play', () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();
    render(<AccountSelectorModal conflict={conflict} onSelect={onSelect} onCancel={onCancel} />);
    const dialog = within(screen.getByRole('dialog', { name: 'Account Conflict Resolution' }));

    expect(dialog.getByText('Synthetic Game')).toBeInTheDocument();
    expect(dialog.getByText('Alice')).toBeInTheDocument();
    expect(dialog.getByText('Bob')).toBeInTheDocument();
    expect(dialog.getByText('Currently Active')).toBeInTheDocument();
    fireEvent.click(dialog.getByRole('button', { name: 'Switch & Play' }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(bob);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('selects the account once when its display text is clicked', () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();
    render(<AccountSelectorModal conflict={conflict} onSelect={onSelect} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Bob'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(bob);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders no dialog when there is no conflict', () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();
    render(<AccountSelectorModal conflict={null} onSelect={onSelect} onCancel={onCancel} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels once when the close button is clicked', () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();
    render(<AccountSelectorModal conflict={conflict} onSelect={onSelect} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).toHaveBeenCalledExactlyOnceWith();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('removes old account data before a fresh render after unmount', () => {
    const first = render(<AccountSelectorModal conflict={conflict} onSelect={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    first.unmount();
    const newAccount: Account = { ...bob, id: 'account-c', displayName: 'Carol', platformUserId: 'synthetic-carol' };
    render(<AccountSelectorModal conflict={{ ...conflict, availableAccounts: [newAccount] }} onSelect={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });
});
