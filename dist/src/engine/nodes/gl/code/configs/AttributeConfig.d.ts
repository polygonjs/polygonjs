import { BaseGlNodeType } from '../../_Base';
import { AttributeGLDefinition } from '../../utils/GLDefinition';
import { ConnectionPointType } from '../../../utils/connections/ConnectionPointType';
export declare class AttributeConfig {
    protected _gl_type: ConnectionPointType;
    protected _name: string;
    constructor(_gl_type: ConnectionPointType, _name: string);
    create_definition(node: BaseGlNodeType): AttributeGLDefinition;
}
