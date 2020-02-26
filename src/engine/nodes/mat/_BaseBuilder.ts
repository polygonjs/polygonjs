import {TypedMatNode} from './_Base';
import {GlAssemblerController} from '../gl/code/Controller';

import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

// import DisplayFlag from '../Concerns/DisplayFlag';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseGlShaderAssembler} from '../gl/code/assemblers/_Base';
import {GlNodeChildrenMap} from '../../poly/registers/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {CustomMaterialName} from '../gl/code/assemblers/_BaseRender';

export abstract class TypedBuilderMatNode<
	A extends BaseGlShaderAssembler,
	K extends NodeParamsConfig
> extends TypedMatNode<ShaderMaterialWithCustomMaterials, K> {
	protected _assembler_controller: GlAssemblerController<A> | undefined;

	//
	//
	// MATERIAL
	//
	//
	create_material() {
		const material = new ShaderMaterial() as ShaderMaterialWithCustomMaterials;

		material.custom_materials = {
			[CustomMaterialName.DEPTH]: new ShaderMaterial(),
			[CustomMaterialName.DEPTH_DOF]: new ShaderMaterial(),
			[CustomMaterialName.DISTANCE]: new ShaderMaterial(),
		};

		return material;
	}
	//
	//
	// ASSEMBLER
	//
	//
	get assembler_controller() {
		return (this._assembler_controller = this._assembler_controller || this._create_assembler_controller());
	}
	protected abstract _create_assembler_controller(): GlAssemblerController<A>;

	create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K] {
		return super.create_node(type) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}

	//
	//
	// COMPILATION
	//
	//
	async compile_if_required() {
		if (this.assembler_controller.compile_required()) {
			this._compile();
		}
	}
	protected abstract _compile(): void;
}

export type BaseBuilderMatNodeType = TypedBuilderMatNode<BaseGlShaderAssembler, NodeParamsConfig>;
