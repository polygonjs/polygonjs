// import {BaseNodeType} from '../../../nodes/_Base';

export enum AssemblerName {
	GL_MESH_BASIC = 'GL_MESH_BASIC',
	GL_MESH_LAMBERT = 'GL_MESH_LAMBERT',
	GL_MESH_STANDARD = 'GL_MESH_STANDARD',
	GL_MESH_PHONG = 'GL_MESH_PHONG',
	GL_MESH_PHYSICAL = 'GL_MESH_PHYSICAL',
	GL_MESH_DEPTH = 'GL_MESH_DEPTH',
	GL_MESH_DISTANCE = 'GL_MESH_DISTANCE',
	GL_PARTICLES = 'GL_PARTICLES',
	GL_POINTS = 'GL_POINTS',
	GL_LINE = 'GL_LINE',
	GL_POST = 'GL_POST',
	GL_RAYMARCHING = 'GL_RAYMARCHING',
	GL_TEXTURE = 'GL_TEXTURE',
	GL_TEXTURE_2D_ARRAY = 'GL_TEXTURE_2D_ARRAY',
	GL_VOLUME = 'GL_VOLUME',
	//
	JS_ACTOR = 'JS_ACTOR',
	JS_SDF = 'JS_SDF',
}

export interface ControllerAssemblerPair {
	controller: any;
	assembler: any;
}
type TraverseCallback = (pair: ControllerAssemblerPair, name: AssemblerName) => void;
export class BaseAssemblersRegister {
	protected _controllerAssemblerByName: Map<AssemblerName, ControllerAssemblerPair> = new Map();

	register(name: AssemblerName, controller: any, assembler: any) {
		this._controllerAssemblerByName.set(name, {
			controller: controller,
			assembler: assembler,
		});
	}

	unregister(name: AssemblerName) {
		this._controllerAssemblerByName.delete(name);
	}

	traverse(callback: TraverseCallback) {
		this._controllerAssemblerByName.forEach(callback);
	}
}
