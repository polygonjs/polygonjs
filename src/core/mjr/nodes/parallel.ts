import { Grid } from "../grid";
import { RuleNode, RunState } from ".";

export class ParallelNode extends RuleNode {
    private newstate: Uint8Array;

    public override async load(
        elem: Element,
        parentSymmetry: Uint8Array,
        grid: Grid
    ) {
        if (!(await super.load(elem, parentSymmetry, grid))) return false;
        this.newstate = new Uint8Array(grid.state.length);
        return true;
    }

    protected override add(r: number, x: number, y: number, z: number): void {
        const ip = this.ip;
        const grid = this.grid;

        const rule = this.rules[r];
        if (ip.rng.double() > rule.p) return;
        this.last |= 1 << r;
        rule.jit_apply_kernel(
            grid.state,
            this.newstate,
            x,
            y,
            z,
            this.ip.changes
        );
        this.matchCount++;
    }

    public override run() {
        const status = super.run();
        if (status !== RunState.SUCCESS) return status;

        const { ip, grid, newstate } = this;

        for (let n = ip.first[ip.counter]; n < ip.changes.length; n++) {
            const [x, y, z] = ip.changes[n];
            let i = x + y * grid.MX + z * grid.MX * grid.MY;
            grid.state[i] = newstate[i];
        }

        this.counter++;
        return this.matchCount > 0 ? RunState.SUCCESS : RunState.FAIL;
    }
}
