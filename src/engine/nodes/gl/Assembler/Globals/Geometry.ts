import {GlobalsBaseController} from './_Base';
import {Globals} from '../../Globals';
import {Attribute} from '../../Attribute';
import {Definition} from '../../Definition/_Module';
import {DefinitionBaseConfig} from '../Config/DefinitionBaseConfig';
import {BaseNodeGl} from '../../_Base';

export class GlobalsGeometryHandler extends GlobalsBaseController {
	static PRE_DEFINED_ATTRIBUTES = [
		'position',
		'color',
		'normal',
		'uv',
		'uv2',
		'morphTarget0',
		'morphTarget1',
		'morphTarget2',
		'morphTarget3',
		'skinIndex',
		'skinWeight',
	];

	static IF_RULE = {
		uv:
			'defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )',
	};

	handle(
		globals_node: Globals,
		output_name: string,
		definitions_by_shader_name: object,
		body_lines_by_shader_name: object,
		body_lines: string[],
		dependencies: string[],
		shader_name: string
	) {
		const named_output = globals_node.io.outputs.named_output_by_name(output_name);
		const var_name = globals_node.gl_var_name(output_name);
		const gl_type = named_output.gl_type();
		const definition = new Definition.Varying(globals_node, gl_type, var_name);
		definitions_by_shader_name[shader_name].push(definition);

		const body_line = `${var_name} = ${gl_type}(${output_name})`;
		for (let dependency of dependencies) {
			definitions_by_shader_name[dependency].push(definition);
			body_lines_by_shader_name[dependency].push(body_line);
		}
		if (dependencies.length == 0) {
			body_lines.push(body_line);
		}
	}

	static variable_config_default(variable_name: string): string {
		return {
			position: 'vec3( position )',
		}[variable_name];
	}
	variable_config_default(variable_name: string): string {
		return GlobalsGeometryHandler.variable_config_default(variable_name);
	}
	// variable_config_required_definitions(variable_name:string):DefinitionBaseConfig[]{
	// 	return null
	// }
	static read_attribute(node: BaseNodeGl, gl_type: string, attrib_name: string, shader_name: string) {
		if (GlobalsGeometryHandler.PRE_DEFINED_ATTRIBUTES.indexOf(attrib_name) < 0) {
			node.add_definitions([new Definition.Attribute(node, gl_type, attrib_name)], 'vertex');
		} else {
			// const if_rule = GlobalsGeometryHandler.IF_RULE[attrib_name]
			// if(if_rule){
			// 	const definition = new Definition.Attribute(node, gl_type, attrib_name)
			// 	definition.set_if_rule(if_rule)
			// 	node.add_definitions([definition])
			// }
		}

		if (!shader_name) {
			throw 'no shader name';
		}
		switch (shader_name) {
			case 'vertex': {
				return attrib_name;
			}
			case 'fragment': {
				// let's assume it is an attribute only
				const var_name = 'varying_' + node.gl_var_name(Attribute.output_name());
				const varying_definition = new Definition.Varying(node, gl_type, var_name);

				const definitions_by_shader_name = {
					vertex: [],
					fragment: [],
				};
				const body_lines_by_shader_name = {
					vertex: [],
					fragment: [],
				};
				definitions_by_shader_name[shader_name].push(varying_definition);

				const set_varying_body_line = `${var_name} = ${gl_type}(${attrib_name})`;
				// if(shader_name == 'vertex'){
				// 	node.add_body_lines([set_varying_body_line])
				// }

				const shader_config = node.shader_config(shader_name);
				const dependencies = shader_config.dependencies();
				for (let dependency of dependencies) {
					definitions_by_shader_name[dependency].push(varying_definition);
					body_lines_by_shader_name[dependency].push(set_varying_body_line);
				}
				// if(dependencies.length == 0){
				// body_lines.push(body_line)
				for (let shader_name of Object.keys(definitions_by_shader_name)) {
					node.add_definitions(definitions_by_shader_name[shader_name], shader_name);
				}
				for (let shader_name of Object.keys(body_lines_by_shader_name)) {
					node.add_body_lines(body_lines_by_shader_name[shader_name], shader_name);
				}
				// node.add_body_lines(body_lines)
				return var_name;
			}
		}

		// const shader_name = node._shader_name // TODO: this is hack
		// const varying_definition = new Definition.Varying(node, gl_type, attrib_name)
		// const var_name = varying_definition.name()
		// definitions_by_shader_name[shader_name].push(varying_definition)
		// const shader_config = node.shader_config(shader_name)
		// const dependencies = shader_config.dependencies()
		// const body_line = `${var_name} = ${gl_type}(${attrib_name})`
		// for(let dependency of dependencies){
		// 	definitions_by_shader_name[dependency].push(varying_definition)
		// 	body_lines_by_shader_name[dependency].push(body_line)
		// }
		// // if(dependencies.length == 0){
		// 	// body_lines.push(body_line)
		// 	node.add_body_lines([body_line])
		// // }
		// for(let shader_name of Object.keys(definitions_by_shader_name)){
		// 	node.add_definitions(definitions_by_shader_name[shader_name], shader_name)
		// }
		// for(let shader_name of Object.keys(body_lines_by_shader_name)){
		// 	node.add_body_lines(body_lines_by_shader_name[shader_name], shader_name)
		// }
		// node.add_body_lines(body_lines)
	}
	read_attribute(node: BaseNodeGl, gl_type: string, attrib_name: string, shader_name: string) {
		return GlobalsGeometryHandler.read_attribute(node, gl_type, attrib_name, shader_name);
	}
}
