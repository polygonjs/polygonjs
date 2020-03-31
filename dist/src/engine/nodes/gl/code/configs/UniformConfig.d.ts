import { BaseGlNodeType } from '../../_Base';
import { UniformGLDefinition } from '../../utils/GLDefinition';
import { ConnectionPointType } from '../../../utils/connections/ConnectionPointType';
export declare class UniformConfig {
    protected _gl_type: ConnectionPointType;
    protected _name: string;
    constructor(_gl_type: ConnectionPointType, _name: string);
    create_definition(node: BaseGlNodeType): UniformGLDefinition;
}
