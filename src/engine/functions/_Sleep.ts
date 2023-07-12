import {NamedFunction1} from './_Base';
import {CoreSleep} from '../../core/Sleep';

export class sleep extends NamedFunction1<[number]> {
	static override type() {
		return 'sleep';
	}
	public override async = true;
	async func(delay: number): Promise<void> {
		await CoreSleep.sleep(delay);
	}
}
