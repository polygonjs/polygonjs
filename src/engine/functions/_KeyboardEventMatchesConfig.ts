import {stringMatchMask} from '../../core/String';
import {NamedFunction5} from './_Base';

export enum KeyModifierRequirement {
	OPTIONAL = 'optional',
	PRESSED = 'pressed',
	NOT_PRESSED = 'not pressed',
}
export const KEY_MODIFIER_REQUIREMENTS: KeyModifierRequirement[] = [
	KeyModifierRequirement.OPTIONAL,
	KeyModifierRequirement.PRESSED,
	KeyModifierRequirement.NOT_PRESSED,
];
function modifierMatchesRequirement(modifier: boolean, requirement: KeyModifierRequirement): boolean {
	if (requirement == KeyModifierRequirement.OPTIONAL) {
		return true;
	}
	if (requirement == KeyModifierRequirement.PRESSED && modifier == true) {
		return true;
	}
	if (requirement == KeyModifierRequirement.NOT_PRESSED && modifier == false) {
		return true;
	}
	return false;
}
export class keyboardEventMatchesConfig extends NamedFunction5<[string, number, number, number, number]> {
	static override type() {
		return 'keyboardEventMatchesConfig';
	}
	func(keyCodes: string, _ctrlKey: number, _shiftKey: number, _altKey: number, _metaKey: number): boolean {
		const events = this.scene.eventsDispatcher.keyboardEventsController.currentEvents();
		if (events.length == 0) {
			return false;
		}

		const eventMatchesAtLeastOneModifier = () => {
			const ctrlKey = KEY_MODIFIER_REQUIREMENTS[_ctrlKey];
			for (let event of events) {
				if (modifierMatchesRequirement(event.ctrlKey, ctrlKey)) {
					return true;
				}
			}
			const shiftKey = KEY_MODIFIER_REQUIREMENTS[_shiftKey];
			for (let event of events) {
				if (modifierMatchesRequirement(event.shiftKey, shiftKey)) {
					return true;
				}
			}
			const altKey = KEY_MODIFIER_REQUIREMENTS[_altKey];
			for (let event of events) {
				if (modifierMatchesRequirement(event.altKey, altKey)) {
					return true;
				}
			}
			const metaKey = KEY_MODIFIER_REQUIREMENTS[_metaKey];
			for (let event of events) {
				if (modifierMatchesRequirement(event.metaKey, metaKey)) {
					return true;
				}
			}
		};
		const eventMatchesAtLeastOneKeyCode = () => {
			for (let event of events) {
				if (keyCodes == '' || stringMatchMask(event.code, keyCodes)) {
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
