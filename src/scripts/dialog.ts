/**
 * Shared open/close wiring for the modal dialogs. Both the terminal and the
 * stack sheet need identical focus and dismissal behaviour, so it lives here
 * rather than being written twice.
 */
export function initDialog(
  dialog: HTMLDialogElement,
  trigger: HTMLElement,
  close: HTMLElement,
  onOpen?: () => void,
): void {
  /* dialog returns focus to the trigger on close and the browser treats that
     restoration as keyboard driven, so a mouse user gets a focus ring they
     never asked for. Tracking the input method keeps it for keyboard only. */
  let viaPointer = false;

  trigger.addEventListener('click', () => {
    dialog.showModal();
    onOpen?.();
  });

  trigger.addEventListener('pointerdown', () => {
    viaPointer = true;
  });

  trigger.addEventListener('keydown', () => {
    viaPointer = false;
  });

  close.addEventListener('click', () => dialog.close());

  dialog.addEventListener('close', () => {
    if (viaPointer) trigger.blur();
  });

  // A backdrop click lands on the dialog itself, never on a child.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
