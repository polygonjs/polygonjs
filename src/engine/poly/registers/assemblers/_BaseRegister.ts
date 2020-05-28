// import {BaseNodeType} from '../../../nodes/_Base';

export enum AssemblerName {
	GL_MESH_BASIC = 'GL_MESH_BASIC',
}

export interface ControllerAssemblerPair {
	controller: any;
	assembler: any;
}

export class BaseAssemblersRegister {
	protected _controller_assembler_by_name: Map<AssemblerName, ControllerAssemblerPair> = new Map();

	register_assembler(name: AssemblerName, controller: any, assembler: any) {
		this._controller_assembler_by_name.set(name, {
			controller: controller,
			assembler: assembler,
		});
	}

	// assembler(node: BaseNodeType, name: AssemblerName) {
	// 	const pair = this._controller_assembler_by_name.get(name);
	// 	if (pair) {
	// 		const controller = pair.controller;
	// 		const assembler = pair.assembler;
	// 		return new controller(node, assembler);
	// 	}
	// 	return pair;
	// }
}
