import {BaseParamType} from '../../../params/_Base';
import {CoreWalker} from '../../../../core/Walker';

export class MissingReference {
	constructor(private param: BaseParamType, public readonly path: string) {}

	absolutePath() {
		if (!this.param.node) {
			return;
		}
		return CoreWalker.makeAbsolutePath(this.param.node, this.path);
	}
	matchesPath(path: string): boolean {
		return this.absolutePath() == path;
	}

	resolveMissingDependencies() {
		const input = this.param.rawInputSerialized();
		this.param.set(this.param.defaultValue());
		this.param.set(input);
	}
}
