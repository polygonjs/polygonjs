// import {Object3D} from 'three/src/core/Object3D';
// import { Mesh } from 'three/src/objects/Mesh';
// import {Group} from 'three/src/objects/Group';
// import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

// interface ShaderMaterialWithIsShaderMaterial extends ShaderMaterial {
// 	isShaderMaterial:boolean
// }
// import {TypedSopNode} from './_Base';

// // const TYPES = {
// // 	DRACO: 'draco',
// // 	GLTF: 'gltf'
// // }
// // const TYPE_VALUES = {
// // 	DRACO: 0,
// // 	GLTF: 1
// // }

// import {BaseNodeType} from '../_Base';
// import {BaseParamType} from '../../params/_Base';
// import {InputCloneMode} from '../../poly/InputCloneMode';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {GLTFExporter} from '../../../../modules/three/examples/jsm/exporters/GLTFExporter';

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class ExportSopParamsConfig extends NodeParamsConfig {
// 	export = ParamConfig.BUTTON(null, {
// 		callback: (node: BaseNodeType, param: BaseParamType) => {
// 			ExportSopNode.PARAM_CALLBACK_export(node as ExportSopNode, param);
// 		},
// 	});
// }
// const ParamsConfig = new ExportSopParamsConfig();

// export class ExportSopNode extends TypedSopNode<ExportSopParamsConfig> {
// 	params_config = ParamsConfig;
// 	static type() {
// 		return 'export';
// 	}

// 	private _exporter: GLTFExporter = new GLTFExporter();

// 	static displayed_input_names(): string[] {
// 		return ['geometry to export'];
// 	}
// 	initialize_node() {
// 		this.io.inputs.set_count(1);
// 		this.io.inputs.init_inputs_clonable_state([InputCloneMode.ALWAYS]);
// 	}

// 	cook(input_contents: CoreGroup[]) {
// 		const core_group = input_contents[0];
// 		this.set_core_group(core_group);
// 	}
// 	static PARAM_CALLBACK_export(node: ExportSopNode, param: BaseParamType) {
// 		node.param_callback_export();
// 	}
// 	private async param_callback_export() {
// 		const container = await this.request_container();

// 		const core_group = container.core_content();
// 		if (core_group) {
// 			const group = new Group();
// 			for (let object of core_group.objects()) {
// 				group.add(object);
// 			}
// 			// if(this._param_type == TYPE_VALUES.DRACO){
// 			// 	await CoreScriptLoader.load_three('libs/draco/draco_encoder.js')
// 			// 	await CoreScriptLoader.load_three_exporter('DRACOExporter')
// 			// 	this._export_draco(group)
// 			// } else {
// 			// if (!this._exporter_class) {
// 			// 	const {GLTFExporter} = await import('modules/three/examples/jsm/exporters/GLTFExporter');
// 			// 	this._exporter_class = GLTFExporter;
// 			// }
// 			this._export_gltf(group);
// 		}

// 		// }
// 	}

// 	exported_file_base_name() {
// 		return this.name;
// 	}

// 	// private _export_draco(group: Object3D){
// 	// 	const class_name = 'DRACOExporter';
// 	// 	const exporter = new THREE[class_name]();
// 	// 	var result = exporter.parse( group );
// 	// 	saveArrayBuffer( result, 'file.drc' );
// 	// }

// 	private _export_gltf(group: Group) {
// 		// const exporter = new this._exporter_class();
// 		var options = {
// 			// trs: document.getElementById( 'option_trs' ).checked,
// 			// onlyVisible: document.getElementById( 'option_visible' ).checked,
// 			// truncateDrawRange: document.getElementById( 'option_drawrange' ).checked,
// 			// binary: true, //document.getElementById( 'option_binary' ).checked,
// 			// forceIndices: document.getElementById( 'option_forceindices' ).checked,
// 			forcePowerOfTwoTextures: true, //document.getElementById( 'option_forcepot' ).checked
// 		};

// 		this._convert_shader_materials(group);

// 		this._exporter.parse(
// 			group,
// 			(result) => {
// 				if (result instanceof ArrayBuffer) {
// 					this.saveArrayBuffer(result, `${this.exported_file_base_name()}.glb`);
// 				} else {
// 					var output = JSON.stringify(result, null, 2);
// 					// console.log( output );
// 					this.saveString(output, `${this.exported_file_base_name()}.gltf`);
// 				}
// 			},
// 			options
// 		);
// 	}

// 	_convert_shader_materials(group: Group) {
// 		const new_material_by_uuid: Dictionary<ShaderMaterialWithIsShaderMaterial> = {};
// 		let material:ShaderMaterialWithIsShaderMaterial;
// 		group.traverse((object3d: Object3D) => {
// 			const object = object3d as Mesh
// 			if (object.material) {
// 				material = object.material as ShaderMaterialWithIsShaderMaterial;
// 				if (material.isShaderMaterial) {
// 					new_material_by_uuid[material.uuid] =
// 						new_material_by_uuid[material.uuid] || material.node.gltf_supported_material();
// 					object.material = new_material_by_uuid[material.uuid];
// 				}
// 			}
// 		});

// 		// group.traverse(object=>{
// 		// 	if(object.material){
// 		// 		material = object.material
// 		// 		if(material.isShaderMaterial){
// 		// 			if(new_material_by_uuid[material.uuid]){
// 		// 				object.material = new_material_by_uuid[material.uuid]
// 		// 				console.log(object.material)
// 		// 			}
// 		// 		}
// 		// 	}
// 		// })
// 	}

// 	private save(blob: Blob, filename:string) {
// 		const link = document.createElement('a');
// 		link.style.display = 'none';
// 		document.body.appendChild(link);

// 		link.href = URL.createObjectURL(blob);
// 		link.download = filename;
// 		link.click();

// 		document.body.removeChild(link);
// 		// URL.revokeObjectURL( url ); breaks Firefox...
// 	}
// 	private saveArrayBuffer(buffer, filename) {
// 		this.save(new Blob([buffer], {type: 'application/octet-stream'}), filename);
// 	}
// 	private saveString(text, filename) {
// 		this.save(new Blob([text], {type: 'text/plain'}), filename);
// 	}
// }
