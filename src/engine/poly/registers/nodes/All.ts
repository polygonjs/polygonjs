import {AnimRegister, AnimNodeChildrenMap} from './Anim';
import {CopRegister, CopNodeChildrenMap} from './Cop';
import {EventRegister, EventNodeChildrenMap} from './Event';
import {GlRegister, GlNodeChildrenMap} from './Gl';
import {JsRegister, JsNodeChildrenMap} from './Js';
import {MatRegister, MatNodeChildrenMap} from './Mat';
import {ObjRegister, ObjNodeChildrenMap} from './Obj';
import {PostRegister, PostNodeChildrenMap} from './Post';
import {RopRegister, RopNodeChildrenMap} from './Rop';
import {SopRegister, GeoNodeChildrenMap} from './Sop';

import {PolyEngine} from '../../../Poly';
import {NodeContext} from '../../NodeContext';

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

export class AllNodesRegister {
	static async run(poly: PolyEngine) {
		AnimRegister.run(poly);
		CopRegister.run(poly);
		EventRegister.run(poly);
		GlRegister.run(poly);
		JsRegister.run(poly);
		MatRegister.run(poly);
		ObjRegister.run(poly);
		PostRegister.run(poly);
		RopRegister.run(poly);
		SopRegister.run(poly);
	}
}
