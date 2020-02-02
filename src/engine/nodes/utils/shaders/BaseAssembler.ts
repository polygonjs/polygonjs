import {TypedNode} from '../../_Base';
import {ShaderName} from './ShaderName';

export abstract class TypedAssembler<T extends TypedNode<any, any, any>> {
	abstract shader_names(): ShaderName[];
	abstract input_names_for_shader_name(node: T, shader_name: ShaderName): string[];
}
