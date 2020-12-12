import { AnimNodeChildrenMap } from './Anim';
import { CopNodeChildrenMap } from './Cop';
import { EventNodeChildrenMap } from './Event';
import { GlNodeChildrenMap } from './Gl';
import { JsNodeChildrenMap } from './Js';
import { MatNodeChildrenMap } from './Mat';
import { ObjNodeChildrenMap } from './Obj';
import { PostNodeChildrenMap } from './Post';
import { RopNodeChildrenMap } from './Rop';
import { GeoNodeChildrenMap } from './Sop';
import { Poly } from '../../../Poly';
import { NodeContext } from '../../NodeContext';
export interface NodeChildrenMapByContext {
    [NodeContext.ANIM]: AnimNodeChildrenMap;
    [NodeContext.COP]: CopNodeChildrenMap;
    [NodeContext.EVENT]: EventNodeChildrenMap;
    [NodeContext.GL]: GlNodeChildrenMap;
    [NodeContext.JS]: JsNodeChildrenMap;
    [NodeContext.MAT]: MatNodeChildrenMap;
    [NodeContext.OBJ]: ObjNodeChildrenMap;
    [NodeContext.POST]: PostNodeChildrenMap;
    [NodeContext.ROP]: RopNodeChildrenMap;
    [NodeContext.SOP]: GeoNodeChildrenMap;
}
export declare class AllNodesRegister {
    static run(poly: Poly): Promise<void>;
}
