// import {NoColors} from 'three/src/constants';
// import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
// import {FrontSide} from 'three/src/constants';
// const THREE = {FrontSide, MeshBasicMaterial, NoColors};
// import {BaseNodeMat} from './_Base';
// import {CoreTextureLoader} from 'src/core/loader/Texture';

// import {Uniforms} from './concerns/Uniforms';
// import {AssemblerOwner} from 'src/Engine/Node/Gl/Assembler/Owner';
// import {ShaderAssemblerBasic} from 'src/Engine/Node/Gl/Assembler/Basic';

// export class MeshBasic extends AssemblerOwner(Uniforms(BaseNodeMat)) {
// 	static type() {
// 		return 'mesh_basic';
// 	}

// 	constructor() {
// 		super();
// 		this._init_common_shader_builder(ShaderAssemblerBasic);
// 	}

// 	// create_material() {
// 	// 	return new THREE.MeshBasicMaterial({
// 	// 		vertexColors: THREE.NoColors,
// 	// 		side: THREE.FrontSide,
// 	// 		color: 0xffffff,
// 	// 		opacity: 0.5
// 	// 	});
// 	// }
// 	//transparent: true
// 	//depthTest: true

// 	create_params() {
// 		this.within_param_folder('common', () => {
// 			this._add_color_params();
// 			this._add_side_params();
// 			this._add_skinning_params();
// 		});
// 		this.within_param_folder('maps', () => {
// 			this._add_params_texture_alpha_map();
// 			this._add_params_texture_map();
// 		});
// 	}

// 	async cook() {
// 		await this.compile_if_required();

// 		this._update_color();
// 		this._update_side();
// 		this._update_skinning();

// 		/*await*/ this._update_texture_alpha_map();
// 		/*await*/ this._update_texture_map();
// 		// this._material.needsUpdate = true // just in case since this seems required in the mini player

// 		// console.log(this._material)
// 		// this.end_cook();

// 		this.set_material(this._material);
// 	}
// }
