import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const DialogFocusContext = React.createContext<{ origin: Element | null; modal: boolean }>({ origin: null, modal: true });

const Dialog = ({ open, defaultOpen = false, onOpenChange, modal = true, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const [focus, setFocus] = React.useState(() => ({ open: isOpen, origin: isOpen ? document.activeElement : null }));
  // Capture before descendants commit: input autoFocus can run before Radix's
  // onOpenAutoFocus. Adjusting render state also avoids mutating a shared ref
  // during a render that React might abandon.
  if (focus.open !== isOpen) {
    setFocus({ open: isOpen, origin: isOpen ? document.activeElement : focus.origin });
  }
  const context = React.useMemo(() => ({ origin: focus.origin, modal }), [focus.origin, modal]);
  return (
    <DialogFocusContext.Provider value={context}>
      <DialogPrimitive.Root {...props} open={isOpen} modal={modal} onOpenChange={next => {
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }} />
    </DialogFocusContext.Provider>
  );
};

const focusableSelector = 'button, input, select, textarea, a[href], [tabindex]';
const canRestoreFocus = (element: Element | null): element is HTMLElement =>
  element instanceof HTMLElement && element.isConnected && element !== document.body &&
  !element.matches(':disabled') && !element.closest('[hidden], [inert], [aria-hidden="true"]');

function restoreDialogFocus(origin: Element | null) {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][data-state="open"]');
  const parent = dialogs[dialogs.length - 1];
  // An underlying dialog must not pull focus out of a newer dialog.
  if (parent && parent.contains(document.activeElement) && !parent.contains(origin)) return;
  if (canRestoreFocus(origin) && (!parent || parent.contains(origin))) {
    origin.focus();
    if (document.activeElement === origin) return;
  }
  const focusRegion = parent ?? document.querySelector('main') ?? document.body;
  const fallback = Array.from(focusRegion.querySelectorAll<HTMLElement>(focusableSelector))
    .find(element => element.tabIndex >= 0 && canRestoreFocus(element));
  if (fallback) fallback.focus();
  else parent?.focus();
}

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onCloseAutoFocus, ...props }, ref) => {
  const { origin, modal } = React.useContext(DialogFocusContext);
  const handleCloseAutoFocus = React.useCallback((event: Event) => {
    onCloseAutoFocus?.(event);
    if (!event.defaultPrevented && modal) {
      event.preventDefault();
      restoreDialogFocus(origin);
    }
  }, [onCloseAutoFocus, origin, modal]);
  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[88dvh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
      onCloseAutoFocus={handleCloseAutoFocus}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground ring-offset-background transition-colors hover:text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 pr-6 text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-snug tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
