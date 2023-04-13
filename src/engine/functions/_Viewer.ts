import {NamedFunction2} from './_Base';

export class setViewer extends NamedFunction2<[string, boolean]> {
	static override type() {
		return 'setViewer';
	}
	func(className: string, addClass: boolean): void {
		const viewer = this.scene.viewersRegister.firstViewer();
		const canvas = viewer?.canvas();
		if (!canvas) {
			return;
		}
		if (viewer) {
			if (addClass) {
				canvas.classList.add(className);
			} else {
				canvas.classList.remove(className);
			}
		}
	}
}
