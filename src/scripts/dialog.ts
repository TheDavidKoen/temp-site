/**
 * Open and close wiring shared by the terminal and the stack sheet.
 */
export function initDialog(
  dialog: HTMLDialogElement,
  trigger: HTMLElement,
  close: HTMLElement,
  onOpen?: () => void,
): void {
  /* The browser treats focus returning to the trigger as keyboard driven, so a mouse
     user would get a stray focus ring. */
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
