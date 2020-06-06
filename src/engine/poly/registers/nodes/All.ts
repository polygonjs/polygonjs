import {AnimRegister} from './Anim';
import {CopRegister} from './Cop';
import {EventRegister} from './Event';
import {GlRegister} from './Gl';
import {JsRegister} from './Js';
import {MatRegister} from './Mat';
import {ObjRegister} from './Obj';
import {PostRegister} from './Post';
import {RopRegister} from './Rop';
import {SopRegister} from './Sop';

import {Poly} from '../../../Poly';

export class AllNodesRegister {
	static async run(poly: Poly) {
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
