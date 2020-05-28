import {BaseNodeType} from '../_Base';

export class PersistedConfig {
	constructor(protected node: BaseNodeType) {}
	to_json(): object | void {}
	load(data: object) {}
}
