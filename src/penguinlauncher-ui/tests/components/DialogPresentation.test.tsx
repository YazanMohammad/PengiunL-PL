import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../src/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs';
import { Input } from '../../src/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../src/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../src/components/ui/tooltip';
import { AccountsManagerModal } from '../../src/components/AccountsManagerModal';
import { GameDetailsModal } from '../../src/components/GameDetailsModal';
import { apiSession } from '../../src/api/session';
import type { Account, Game } from '../../src/types';

const alice: Account = { id: 'alice', displayName: 'Alice', platform: 'Steam', platformUserId: 'synthetic-a', isActive: true, sessionBackupPath: null, lastLogin: null };
const bob: Account = { ...alice, id: 'bob', displayName: 'Bob', platformUserId: 'synthetic-b', isActive: false };
const game: Game = { id: 'game-a', name: 'Synthetic Game', platform: 'Steam', platformGameId: '100', installPath: 'C:/Synthetic/Game', launchUri: 'steam://run/100', coverImageUrl: null, backgroundImageUrl: null, associatedAccountIds: ['alice', 'bob'], isInstalled: true };
const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const response = (data: unknown) => new Response(JSON.stringify(data));

function manager(overrides: Partial<React.ComponentProps<typeof AccountsManagerModal>> = {}) {
  const props = { open: true, onOpenChange: vi.fn(), accounts: [alice, bob], games: [game], onSwapAccount: vi.fn().mockResolvedValue(undefined), onRefresh: vi.fn(), swappingAccountId: null, onViewAccountGames: vi.fn(), ...overrides };
  render(<AccountsManagerModal {...props} />);
  return props;
}

// Catch translucent/blurred chrome returning to the deliberately flat design.
function expectFlat(element: HTMLElement, background: string) {
  expect(element).toHaveClass(background, 'border-border');
  expect(element.className).not.toMatch(/backdrop-blur|bg-(?:zinc|black|white).*\/|gradient|shadow-(?:lg|xl|2xl|inner)/);
}

describe('shared presentation contracts', () => {
  it('keeps focus in a newer dialog when an underlying controlled dialog closes', async () => {
    function Stacked() {
      const [parentOpen, setParentOpen] = useState(false);
      const [childOpen, setChildOpen] = useState(false);
      return <main><button onClick={() => setParentOpen(true)}>Open parent</button>
        <button>Outside</button>
        <Dialog open={parentOpen} onOpenChange={setParentOpen}><DialogContent>
          <DialogTitle>Parent</DialogTitle><DialogDescription>Parent layer</DialogDescription>
          <button onClick={() => setChildOpen(true)}>Open child</button>
        </DialogContent></Dialog>
        <Dialog open={childOpen} onOpenChange={setChildOpen}><DialogContent>
          <DialogTitle>Child</DialogTitle><DialogDescription>Child layer</DialogDescription>
          <button onClick={() => setParentOpen(false)}>Close underlying parent</button>
          <button>Keep child focus</button>
        </DialogContent></Dialog></main>;
    }
    render(<Stacked />);
    screen.getByRole('button', { name: 'Open parent' }).focus();
    fireEvent.click(document.activeElement!);
    const openChild = screen.getByRole('button', { name: 'Open child' });
    openChild.focus();
    fireEvent.click(openChild);
    const child = screen.getByRole('dialog', { name: 'Child' });
    screen.getByRole('button', { name: 'Outside', hidden: true }).focus();
    expect(child).toContainElement(document.activeElement as HTMLElement);
    const childFocus = within(child).getByRole('button', { name: 'Keep child focus' });
    childFocus.focus();
    fireEvent.click(within(child).getByRole('button', { name: 'Close underlying parent' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Parent', hidden: true })).not.toBeInTheDocument());
    // Wait through Radix's delayed close autofocus rather than only unmount.
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
    expect(childFocus).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open parent' })).toHaveFocus());
  });

  it('composes caller autofocus handlers and honors prevented close restoration', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Open controlled</button>
        <button>Caller return</button>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent
          onOpenAutoFocus={event => { event.preventDefault(); screen.getByRole('button', { name: 'Custom initial' }).focus(); }}
          onCloseAutoFocus={event => { event.preventDefault(); screen.getByRole('button', { name: 'Caller return' }).focus(); }}>
          <DialogTitle>Controlled</DialogTitle><DialogDescription>Caller focus choices</DialogDescription>
          <button>Custom initial</button>
        </DialogContent></Dialog></>;
    }
    render(<Controlled />);
    screen.getByRole('button', { name: 'Open controlled' }).focus();
    fireEvent.click(document.activeElement!);
    expect(screen.getByRole('button', { name: 'Custom initial' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Caller return' })).toHaveFocus());
  });

  it('uses a connected fallback when a controlled dialog origin is removed', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      const [removed, setRemoved] = useState(false);
      return <main>{!removed && <button onClick={() => { setRemoved(true); setOpen(true); }}>Removed origin</button>}
        <button>Library fallback</button>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent>
          <DialogTitle>Transient</DialogTitle><DialogDescription>Removed originating control</DialogDescription>
        </DialogContent></Dialog></main>;
    }
    render(<Controlled />);
    const origin = screen.getByRole('button', { name: 'Removed origin' });
    origin.focus();
    fireEvent.click(origin);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Library fallback' })).toHaveFocus());
  });

  it('dialog surface is opaque and flat with bounded scrolling', () => {
    render(<Dialog open><DialogContent><DialogTitle>Surface</DialogTitle><DialogDescription>Surface description</DialogDescription></DialogContent></Dialog>);
    const dialog = screen.getByRole('dialog', { name: 'Surface' });
    expectFlat(dialog, 'bg-card');
    expect(dialog).toHaveClass('overflow-y-auto', 'max-h-[88dvh]');
    expect(document.querySelector('[data-state="open"][class*="fixed inset-0"]')?.className).not.toContain('backdrop-blur');
  });

  it('tabs and input use neutral theme surfaces while selected tabs remain identifiable', () => {
    render(<><Tabs defaultValue="steam"><TabsList aria-label="Platforms"><TabsTrigger value="steam">Steam</TabsTrigger><TabsTrigger value="epic">Epic</TabsTrigger></TabsList><TabsContent value="steam">Steam profiles</TabsContent><TabsContent value="epic">Epic profiles</TabsContent></Tabs><label htmlFor="alias">Alias</label><Input id="alias" /></>);
    expectFlat(screen.getByRole('tablist'), 'bg-background');
    expectFlat(screen.getByRole('textbox', { name: 'Alias' }), 'bg-background');
    expect(screen.getByRole('tab', { name: 'Steam' })).toHaveClass('data-[state=active]:bg-secondary', 'data-[state=active]:text-foreground');
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Epic' }), { button: 0, ctrlKey: false });
    expect(screen.getByRole('tab', { name: 'Epic' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Epic profiles');
  });

  it('menus use opaque neutral surfaces', () => {
    render(<DropdownMenu open><DropdownMenuTrigger>Settings</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Density</DropdownMenuItem></DropdownMenuContent></DropdownMenu>);
    expectFlat(screen.getByRole('menu'), 'bg-popover');
  });

  it('tooltips use opaque neutral surfaces', () => {
    render(<TooltipProvider><Tooltip open><TooltipTrigger>Info</TooltipTrigger><TooltipContent>Help</TooltipContent></Tooltip></TooltipProvider>);
    expectFlat(screen.getByText('Help', { selector: '[data-state]' }), 'bg-popover');
  });

  it('Escape closes the real dialog and restores focus to its trigger', async () => {
    render(<Dialog><DialogTrigger>Open details</DialogTrigger><DialogContent><DialogTitle>Details</DialogTitle><DialogDescription>Details description</DialogDescription></DialogContent></Dialog>);
    const trigger = screen.getByRole('button', { name: 'Open details' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe('account manager presentation and preserved workflows', () => {
  it.each([
    ['Add Profile', 'Add Account Profile'],
    ['Capture Active', 'Capture Active Session'],
    ['Rename Bob', 'Rename Profile Alias'],
    ['Remove Bob', 'Remove Profile?'],
  ])('%s nested dismissal restores its parent action', async (action, title) => {
    manager();
    const origin = screen.getByRole('button', { name: action });
    origin.focus();
    fireEvent.click(origin);
    const nested = screen.getByRole('dialog', { name: title });
    expect(nested).toContainElement(document.activeElement as HTMLElement);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: title })).not.toBeInTheDocument());
    await waitFor(() => expect(origin).toHaveFocus());
    expect(screen.getByRole('dialog', { name: 'Account Hot-Switcher & Manager' })).toBeInTheDocument();
  });

  it('does not announce a previous capture failure in a newly opened Add form', async () => {
    apiSession.connect(TOKEN);
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{"error":"Synthetic capture unavailable"}', { status: 503 }));
    manager();
    fireEvent.click(screen.getByRole('button', { name: 'Capture Active' }));
    const capture = within(screen.getByRole('dialog', { name: 'Capture Active Session' }));
    fireEvent.click(capture.getByRole('button', { name: 'Capture Session' }));
    expect(await capture.findByRole('alert')).toHaveTextContent('Synthetic capture unavailable');
    fireEvent.click(capture.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Synthetic capture unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Add Profile' }));
    const add = within(screen.getByRole('dialog', { name: 'Add Account Profile' }));
    expect(add.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledOnce();
    fireEvent.click(add.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Synthetic capture unavailable');
  });

  it('active modal chrome and account rows are flat', () => {
    manager();
    const dialog = screen.getByRole('dialog', { name: 'Account Hot-Switcher & Manager' });
    expectFlat(dialog, 'bg-card');
    expect(dialog.innerHTML).not.toMatch(/backdrop-blur|bg-gradient|shadow-md|rounded-2xl/);
  });

  it('platform filters expose their selected state and retain filtering and logout', async () => {
    apiSession.connect(TOKEN);
    vi.mocked(fetch).mockResolvedValueOnce(response({ success: true, message: 'Synthetic logout' }));
    manager({ accounts: [alice, { ...bob, platform: 'Epic' }] });
    const steam = screen.getByRole('button', { name: /^Steam 1$/ });
    expect(steam).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(steam);
    expect(steam).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Steam Session to Log In' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Logged out of Steam.');
    expect(fetch).toHaveBeenCalledWith('/api/accounts/logout/Steam', expect.objectContaining({ method: 'POST' }));
  });

  it('manual addition has labeled fields, disabled saving and announced success', async () => {
    apiSession.connect(TOKEN);
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const props = manager();
    fireEvent.click(screen.getByRole('button', { name: 'Add Profile' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Add Account Profile' }));
    expect(dialog.getByRole('group', { name: 'Launcher Platform' })).toBeInTheDocument();
    const name = dialog.getByRole('textbox', { name: /Profile Display Name/ });
    const userId = dialog.getByRole('textbox', { name: /Platform User ID/ });
    expect(dialog.getByRole('button', { name: 'Add Profile' })).toBeDisabled();
    fireEvent.change(name, { target: { value: ' Carol ' } });
    fireEvent.change(userId, { target: { value: ' synthetic-carol ' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Epic' }));
    expect(dialog.getByRole('button', { name: 'Epic' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(dialog.getByRole('button', { name: 'Add Profile' }));
    expect(dialog.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(fetch).toHaveBeenCalledWith('/api/accounts/add', expect.objectContaining({ method: 'POST', body: JSON.stringify({ displayName: 'Carol', platform: 'Epic', platformUserId: 'synthetic-carol' }) }));
    await act(async () => finish(response({ ...bob, displayName: 'Carol' })));
    expect(screen.getByRole('status')).toHaveTextContent('Added profile:');
    expect(screen.queryByRole('dialog', { name: 'Add Account Profile' })).not.toBeInTheDocument();
    expect(props.onRefresh).toHaveBeenCalledOnce();
  });

  it('capture retains the target platform and optional name and announces server errors', async () => {
    apiSession.connect(TOKEN);
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{"error":"Synthetic capture unavailable"}', { status: 503 }));
    const props = manager();
    fireEvent.click(screen.getByRole('button', { name: /^Epic 0$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Capture Active' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Capture Active Session' }));
    expect(dialog.getByRole('group', { name: 'Target Platform' })).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: 'Epic' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(dialog.getByRole('textbox', { name: 'Custom Name (Optional)' }), { target: { value: 'Synthetic Capture' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Capture Session' }));
    expect(dialog.getByRole('button', { name: 'Capturing...' })).toBeDisabled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Synthetic capture unavailable');
    expect(fetch).toHaveBeenCalledWith('/api/accounts/capture', expect.objectContaining({ method: 'POST', body: JSON.stringify({ platform: 'Epic', displayName: 'Synthetic Capture' }) }));
    expect(props.onRefresh).not.toHaveBeenCalled();
  });

  it('rename and removal remain account-specific and retain the deletion warning', async () => {
    apiSession.connect(TOKEN);
    vi.mocked(fetch).mockResolvedValueOnce(response({ ...bob, displayName: 'Robert' })).mockResolvedValueOnce(response({ success: true, message: 'Synthetic removal' }));
    const props = manager();
    fireEvent.click(screen.getByRole('button', { name: 'Rename Bob' }));
    const rename = within(screen.getByRole('dialog', { name: 'Rename Profile Alias' }));
    fireEvent.change(rename.getByRole('textbox', { name: 'New Display Name' }), { target: { value: ' Robert ' } });
    fireEvent.click(rename.getByRole('button', { name: 'Save Name' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Rename Profile Alias' })).not.toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/accounts/rename', expect.objectContaining({ body: JSON.stringify({ accountId: 'bob', newDisplayName: 'Robert' }) }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Bob' }));
    const removal = within(screen.getByRole('dialog', { name: 'Remove Profile?' }));
    expect(removal.getByText(/delete the local session backup/)).toBeInTheDocument();
    fireEvent.click(removal.getByRole('button', { name: 'Remove Profile' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Remove Profile?' })).not.toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/accounts/bob', expect.objectContaining({ method: 'DELETE' }));
    expect(props.onRefresh).toHaveBeenCalledTimes(2);
  });

  it('switch, busy state, library navigation, refresh and Done retain their callbacks', () => {
    const props = manager();
    expect(screen.getByRole('button', { name: /Current/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Switch' }));
    expect(props.onSwapAccount).toHaveBeenCalledExactlyOnceWith(bob);
    fireEvent.click(screen.getAllByRole('button', { name: /View in Library/ })[1]);
    expect(props.onViewAccountGames).toHaveBeenCalledExactlyOnceWith('bob');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(props.onRefresh).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(props.onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('announces a pending account swap and prevents repeated switching', () => {
    manager({ swappingAccountId: 'bob' });
    expect(screen.getByRole('status')).toHaveTextContent('Swapping...');
    expect(screen.getByRole('button', { name: 'Swapping...' })).toBeDisabled();
  });
});

describe('game details presentation and preserved actions', () => {
  it('details are flat and retain account-targeted and automatic launch arguments', () => {
    const onPlay = vi.fn();
    render(<GameDetailsModal game={game} accounts={[alice, bob]} onClose={vi.fn()} onPlay={onPlay} onMapAccount={vi.fn()} launching={false} />);
    const dialog = screen.getByRole('dialog', { name: 'Synthetic Game' });
    expectFlat(dialog, 'bg-card');
    expect(dialog.innerHTML).not.toMatch(/backdrop-blur|bg-gradient|rounded-xl|shadow-lg/);
    fireEvent.click(screen.getByRole('button', { name: 'Switch & Play' }));
    expect(onPlay).toHaveBeenLastCalledWith(game, 'bob');
    fireEvent.click(screen.getByRole('button', { name: 'Auto-Launch Title' }));
    expect(onPlay).toHaveBeenLastCalledWith(game);
    expect(screen.getByText('Multiple Profiles')).toBeInTheDocument();
    expect(screen.getByText('steam://run/100')).toBeInTheDocument();
  });

  it('busy install is announced and all launch actions stay disabled', () => {
    const onPlay = vi.fn();
    render(<GameDetailsModal game={{ ...game, isInstalled: false }} accounts={[alice, bob]} onClose={vi.fn()} onPlay={onPlay} onMapAccount={vi.fn()} launching />);
    expect(screen.getByRole('status')).toHaveTextContent('Preparing Install...');
    for (const name of ['Install', 'Switch & Install', 'Preparing Install...']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name }));
    }
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('keeps no-profile guidance, installation action and Escape close behavior', () => {
    const onClose = vi.fn();
    const onPlay = vi.fn();
    const unowned = { ...game, isInstalled: false, associatedAccountIds: [] };
    render(<GameDetailsModal game={unowned} accounts={[]} onClose={onClose} onPlay={onPlay} onMapAccount={vi.fn()} launching={false} />);
    expect(screen.getByText(/Active launcher session will be used/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Auto-Install Title' }));
    expect(onPlay).toHaveBeenCalledExactlyOnceWith(unowned);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });
});
