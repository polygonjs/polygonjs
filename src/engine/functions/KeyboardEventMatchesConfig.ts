import {CoreString} from '../../core/String';
import {isBooleanTrue} from '../../core/Type';
import {NamedFunction5} from './_Base';

export class keyboardEventMatchesConfig extends NamedFunction5<[string, boolean, boolean, boolean, boolean]> {
	static override type() {
		return 'keyboardEventMatchesConfig';
	}
	func(keyCodes: string, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean): boolean {
		const events = this.scene.eventsDispatcher.keyboardEventsController.currentEvents();
		if (events.length == 0) {
			return false;
		}

		const eventMatchesAtLeastOneModifier = () => {
			for (let event of events) {
				if (event.ctrlKey == isBooleanTrue(ctrlKey)) {
					return true;
				}
			}
			for (let event of events) {
				if (event.altKey == isBooleanTrue(altKey)) {
					return true;
				}
			}

			for (let event of events) {
				if (event.shiftKey == isBooleanTrue(shiftKey)) {
					return true;
				}
			}

			for (let event of events) {
				if (event.metaKey == isBooleanTrue(metaKey)) {
					return true;
				}
			}
		};
		const eventMatchesAtLeastOneKeyCode = () => {
			for (let event of events) {
				if (CoreString.matchMask(event.code, keyCodes)) {
					return true;
				}
			}
		};
		if (!eventMatchesAtLeastOneModifier()) {
			return false;
		}
		if (!eventMatchesAtLeastOneKeyCode()) {
			return false;
		}
		return true;
	}
}
