import {NamedFunction1} from './_Base';
import {CoreSleep} from '../../core/Sleep';

export class sleep extends NamedFunction1<[number]> {
	static override type() {
		return 'sleep';
	}
	async func(delay: number): Promise<void> {
		await CoreSleep.sleep(delay);
	}
	override asString(delay: string): string {
		const sync = super.asString(delay);
		return `await ${sync};`;
	}
}
