const CONTEXT_MENU_DISABLER = (event: MouseEvent) => {
	event.preventDefault();
	return false;
};
export class CoreDomUtils {
	static disableContextMenu() {
		document.addEventListener('contextmenu', CONTEXT_MENU_DISABLER);
	}
	static reEstablishContextMenu() {
		document.removeEventListener('contextmenu', CONTEXT_MENU_DISABLER);
	}
}
