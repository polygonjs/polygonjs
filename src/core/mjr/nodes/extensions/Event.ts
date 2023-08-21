import {RunState} from '../Common';
import {Grid} from '../../Grid';
import {Helper} from '../../helpers/Helper';
import {ScopeNode} from '../Scope';

export class EventNode extends ScopeNode<EventHandlerNode> {
	public timeout: number = 1000;

	public start = 0;

	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		this.timeout = parseInt(elem.getAttribute('timeout') || '1000');
		if (this.timeout < 0 || isNaN(this.timeout)) {
			console.error(elem, 'must define timeout');
			return false;
		}

		const tasks: Promise<EventHandlerNode | null>[] = [];
		for (const child of Helper.elemChildren(elem)) {
			if (!EventNode.VALID_EVENT_TAGS.has(child.tagName)) {
				console.error(child, 'Invalid tag in <event>');
				return false;
			}

			const handler: EventHandlerNode | null = {
				keypress: () => {
					const key = child.getAttribute('key');
					if (!key) {
						console.error(child, 'must define key');
						return null;
					}
					// const options: KeypressNodeOptions = {
					// 	ip: this.ip,
					// 	grid,
					// 	source: child as any, //<typeof handler.source>child,
					// 	comment: child.getAttribute('comment'),
					// 	sync: false,
					// 	break: child.getAttribute('break') === 'True',
					// 	key,
					// 	ref: this.map.keyup,
					// };
					const node = new KeypressNode(key, this.map.keyup);
					node.break = child.getAttribute('break') === 'True';
					return node;
				},
			}[child.tagName as 'keypress']();

			if (!handler) return false;

			// handler.ip = this.ip;
			// handler.grid = grid;
			// handler.source = <typeof handler.source>child;
			// handler.comment = child.getAttribute('comment');
			// handler.break = child.getAttribute('break') === 'True';

			tasks.push(
				(async () => {
					const loaded = await handler.load(child, parentSymmetry, grid);
					return loaded ? handler : null;
				})()
			);
		}

		const handlers = await Promise.all(tasks);
		if (handlers.some((handle) => !handle)) return false;
		this.children.splice(0, this.children.length, ...(handlers as EventHandlerNode[]));

		return true;
	}

	public override run() {
		const {ip, timeout} = this;
		if (!ip) {
			return RunState.FAIL;
		}

		if (this.start > 0) {
			if (ip.time - this.start > timeout) {
				this.start = 0;
				ip.listener = null;
				return RunState.FAIL;
			}
		} else {
			this.start = ip.time;
			ip.listener = this;
		}

		const {current} = ip;

		for (const c of this.children) {
			if (c.active() && c.break) this.start = 1;

			let status = c.run();
			ip.increChanges();

			// Force sync, might block forever
			while (status !== RunState.FAIL) {
				status = c.run();
				ip.increChanges();
			}
			c.reset();
		}

		ip.blocking = false;
		ip.current = current;

		this.flushEvents();
		this.n = -1;

		return RunState.SUCCESS;
	}

	public override reset(): void {
		super.reset();
		this.n = -1;
		this.start = 0;
		this.flushEvents();
	}

	private map = {
		keydown: new Set<string>(),
		keyup: new Set<string>(),
	};

	public event(name: string, key: string) {
		switch (name) {
			case 'keydown': {
				this.map.keydown.add(key);
				break;
			}
			case 'keyup': {
				this.map.keyup.add(key);
				break;
			}
		}
	}

	protected flushEvents() {
		this.map.keydown.clear();
		this.map.keyup.clear();
	}

	private static readonly VALID_EVENT_TAGS = new Set(['keypress']);
}

// Node.registerExt('event', EventNode as any);

// interface EventHandlerNodeOptions extends NodeOptions<Node> {
// 	break: boolean;
// }

export abstract class EventHandlerNode extends ScopeNode {
	public break: boolean = false;
	public abstract active(): boolean;

	constructor() {
		super();
		// this.break = _break;
		this.n = -1;
	}

	public override run() {
		if (this.active()) return super.run();
		return RunState.FAIL;
	}
}
// interface KeypressNodeOptions extends EventHandlerNodeOptions {
// 	key: string;
// 	ref: Set<string>;
// }

class KeypressNode extends EventHandlerNode {
	private readonly key: string;
	private readonly ref: Set<string>;

	constructor(key: string, ref: Set<string>) {
		super();
		this.key = key;
		this.ref = ref;
	}

	public active(): boolean {
		return this.ref.has(this.key);
	}
}
