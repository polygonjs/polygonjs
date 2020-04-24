import { GlobalsBaseController } from './_Base';
import { GlobalsGlNode } from '../../Globals';
import { AttributeGlNode } from '../../Attribute';
import { ConnectionPointType } from '../../../utils/connections/ConnectionPointType';
import { BaseGlNodeType } from '../../_Base';
import { ShadersCollectionController } from '../utils/ShadersCollectionController';
export declare class GlobalsGeometryHandler extends GlobalsBaseController {
    static PRE_DEFINED_ATTRIBUTES: string[];
    static IF_RULE: {
        uv: string;
    };
    handle_globals_node(globals_node: GlobalsGlNode, output_name: string, shaders_collection_controller: ShadersCollectionController): void;
    static variable_config_default(variable_name: string): string | undefined;
    variable_config_default(variable_name: string): string | undefined;
    read_attribute(node: BaseGlNodeType, gl_type: ConnectionPointType, attrib_name: string, shaders_collection_controller: ShadersCollectionController): string | undefined;
    static read_attribute(node: BaseGlNodeType, gl_type: ConnectionPointType, attrib_name: string, shaders_collection_controller: ShadersCollectionController): string | undefined;
    handle_attribute_node(node: AttributeGlNode, gl_type: ConnectionPointType, attrib_name: string, shaders_collection_controller: ShadersCollectionController): string | undefined;
}
