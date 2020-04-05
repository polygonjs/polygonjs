import {CopRegister} from './Cop';
import {EventRegister} from './Event';
import {GlRegister} from './Gl';
import {MatRegister} from './Mat';
import {ObjRegister} from './Obj';
import {SopRegister} from './Sop';

import {Poly} from '../../Poly';

export class AllRegister {
	static async run() {
		// const {CopRegister} = await import(/* webpackChunkName: "Cop" */ './Cop');
		CopRegister.run(Poly.instance());

		// const {EventRegister} = await import(/* webpackChunkName: "Event" */ './Event');
		EventRegister.run(Poly.instance());

		// const {GlRegister} = await import(/* webpackChunkName: "Gl" */ './Gl');
		GlRegister.run(Poly.instance());

		// const {MatRegister} = await import(/* webpackChunkName: "Mat" */ './Mat');
		MatRegister.run(Poly.instance());

		// const {ObjRegister} = await import(/* webpackChunkName: "Obj" */ './Obj');
		ObjRegister.run(Poly.instance());

		// const {SopRegister} = await import(/* webpackChunkName: "Sop" */ './Sop');
		SopRegister.run(Poly.instance());
	}
}
