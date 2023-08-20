import seedrandom, { PRNG } from "seedrandom";
import { Grid } from "../grid";
import { Helper, vec3, vec4 } from "../helpers/helper";

import { Node, RunState } from ".";

export class PathNode extends Node {
    public start: number;
    public finish: number;
    public substrate: number;
    public value: number;
    public inertia: boolean;
    public longest: boolean;
    public edges: boolean;
    public vertices: boolean;

    public override async load(elem: Element, _: Uint8Array, grid: Grid) {
        const startSymbols = elem.getAttribute("from");
        this.start = grid.wave(startSymbols);
        this.value = grid.values.get(
            (elem.getAttribute("color") || startSymbols).charCodeAt(0)
        );
        this.finish = grid.wave(elem.getAttribute("to"));

        this.inertia = elem.getAttribute("inertia") === "True";
        this.longest = elem.getAttribute("longest") === "True";
        this.edges = elem.getAttribute("edges") === "True";
        this.vertices = elem.getAttribute("vertices") === "True";
        this.substrate = grid.wave(elem.getAttribute("on"));
        return true;
    }

    public override reset() {}

    public override run() {
        const { grid, substrate, start, finish, edges, vertices } = this;

        const queue: vec4[] = [];
        const startPositions: vec3[] = [];
        const generations = new Int32Array(grid.state.length);
        generations.fill(-1);

        const { MX, MY, MZ } = grid;

        for (let z = 0; z < MZ; z++)
            for (let y = 0; y < MY; y++)
                for (let x = 0; x < MX; x++) {
                    const i = x + y * MX + z * MX * MY;
                    generations[i] = -1;

                    const s = grid.state[i];
                    if ((start & (1 << s)) != 0) startPositions.push([x, y, z]);
                    if ((finish & (1 << s)) != 0) {
                        generations[i] = 0;
                        queue.push([0, x, y, z]);
                    }
                }

        if (!startPositions.length || !queue.length) return RunState.FAIL;

        const push = (t: number, x: number, y: number, z: number) => {
            let i = x + y * MX + z * MX * MY;
            const v = grid.state[i];
            if (
                generations[i] == -1 &&
                ((substrate & (1 << v)) != 0 || (start & (1 << v)) != 0)
            ) {
                if ((substrate & (1 << v)) != 0) queue.push([t, x, y, z]);
                generations[i] = t;
            }
        };

        while (queue.length) {
            const [t, x, y, z] = queue.shift();
            for (const [dx, dy, dz] of PathNode.directions(
                x,
                y,
                z,
                MX,
                MY,
                MZ,
                edges,
                vertices
            ))
                push(t + 1, x + dx, y + dy, z + dz);
        }

        if (
            !startPositions.some(
                ([px, py, pz]) => generations[px + py * MX + pz * MX * MY] > 0
            )
        )
            return RunState.FAIL;

        const local = seedrandom(this.ip.rng.int32().toString());
        let min = MX * MY * MZ,
            max = -1;
        let argmin: vec3 = [-1, -1, -1];
        let argmax: vec3 = [-1, -1, -1];

        for (const [px, py, pz] of startPositions) {
            const g = generations[px + py * MX + pz * MX * MY];
            if (g == -1) continue;
            const dg = g;
            const noise = 0.1 * local.double();

            if (dg + noise < min) {
                min = dg + noise;
                argmin = [px, py, pz];
            }

            if (dg + noise > max) {
                max = dg + noise;
                argmax = [px, py, pz];
            }
        }

        let [penx, peny, penz] = this.longest ? argmax : argmin;
        let [dirx, diry, dirz] = this.direction(
            penx,
            peny,
            penz,
            0,
            0,
            0,
            generations,
            local
        );
        penx += dirx;
        peny += diry;
        penz += dirz;

        while (generations[penx + peny * MX + penz * MX * MY]) {
            grid.state[penx + peny * MX + penz * MX * MY] = this.value;
            this.ip.changes.push([penx, peny, penz]);
            [dirx, diry, dirz] = this.direction(
                penx,
                peny,
                penz,
                dirx,
                diry,
                dirz,
                generations,
                local
            );
            penx += dirx;
            peny += diry;
            penz += dirz;
        }

        return RunState.SUCCESS;
    }

    private direction(
        x: number,
        y: number,
        z: number,
        dx: number,
        dy: number,
        dz: number,
        generations: Int32Array,
        rng: PRNG
    ): vec3 {
        const candidates: vec3[] = [];
        const { grid, vertices, edges, inertia } = this;
        const { MX, MY, MZ } = grid;
        const g = generations[x + y * MX + z * MX * MY];

        const add = (DX: number, DY: number, DZ: number) => {
            if (
                generations[x + DX + (y + DY) * MX + (z + DZ) * MX * MY] ==
                g - 1
            )
                candidates.push([DX, DY, DZ]);
        };

        if (!vertices && !edges) {
            if (dx != 0 || dy != 0 || dz != 0) {
                let cx = x + dx,
                    cy = y + dy,
                    cz = z + dz;
                if (
                    inertia &&
                    cx >= 0 &&
                    cy >= 0 &&
                    cz >= 0 &&
                    cx < MX &&
                    cy < MY &&
                    cz < MZ &&
                    generations[cx + cy * MX + cz * MX * MY] == g - 1
                )
                    return [dx, dy, dz];
            }

            if (x > 0) add(-1, 0, 0);
            if (x < MX - 1) add(1, 0, 0);
            if (y > 0) add(0, -1, 0);
            if (y < MY - 1) add(0, 1, 0);
            if (z > 0) add(0, 0, -1);
            if (z < MZ - 1) add(0, 0, 1);

            return Helper.pick(candidates, rng);
        } else {
            for (const p of PathNode.directions(
                x,
                y,
                z,
                MX,
                MY,
                MZ,
                edges,
                vertices
            ))
                add(p[0], p[1], p[2]);
            let result: vec3 = [-1, -1, -1];

            if (inertia && (dx != 0 || dy != 0 || dz != 0)) {
                let maxScalar = -4;
                for (const [cx, cy, cz] of candidates) {
                    const noise = 0.1 * rng.double();
                    const cos =
                        (cx * dx + cy * dy + cz * dz) /
                        Math.sqrt(
                            (cx * cx + cy * cy + cz * cz) *
                                (dx * dx + dy * dy + dz * dz)
                        );

                    if (cos + noise > maxScalar) {
                        maxScalar = cos + noise;
                        result = [cx, cy, cz];
                    }
                }
            } else result = Helper.pick(candidates, rng);

            return result;
        }
    }

    private static directions(
        x: number,
        y: number,
        z: number,
        MX: number,
        MY: number,
        MZ: number,
        edges: boolean,
        vertices: boolean
    ) {
        const result: vec3[] = [];
        if (MZ == 1) {
            if (x > 0) result.push([-1, 0, 0]);
            if (x < MX - 1) result.push([1, 0, 0]);
            if (y > 0) result.push([0, -1, 0]);
            if (y < MY - 1) result.push([0, 1, 0]);

            if (edges) {
                if (x > 0 && y > 0) result.push([-1, -1, 0]);
                if (x > 0 && y < MY - 1) result.push([-1, 1, 0]);
                if (x < MX - 1 && y > 0) result.push([1, -1, 0]);
                if (x < MX - 1 && y < MY - 1) result.push([1, 1, 0]);
            }
        } else {
            if (x > 0) result.push([-1, 0, 0]);
            if (x < MX - 1) result.push([1, 0, 0]);
            if (y > 0) result.push([0, -1, 0]);
            if (y < MY - 1) result.push([0, 1, 0]);
            if (z > 0) result.push([0, 0, -1]);
            if (z < MZ - 1) result.push([0, 0, 1]);

            if (edges) {
                if (x > 0 && y > 0) result.push([-1, -1, 0]);
                if (x > 0 && y < MY - 1) result.push([-1, 1, 0]);
                if (x < MX - 1 && y > 0) result.push([1, -1, 0]);
                if (x < MX - 1 && y < MY - 1) result.push([1, 1, 0]);

                if (x > 0 && z > 0) result.push([-1, 0, -1]);
                if (x > 0 && z < MZ - 1) result.push([-1, 0, 1]);
                if (x < MX - 1 && z > 0) result.push([1, 0, -1]);
                if (x < MX - 1 && z < MZ - 1) result.push([1, 0, 1]);

                if (y > 0 && z > 0) result.push([0, -1, -1]);
                if (y > 0 && z < MZ - 1) result.push([0, -1, 1]);
                if (y < MY - 1 && z > 0) result.push([0, 1, -1]);
                if (y < MY - 1 && z < MZ - 1) result.push([0, 1, 1]);
            }

            if (vertices) {
                if (x > 0 && y > 0 && z > 0) result.push([-1, -1, -1]);
                if (x > 0 && y > 0 && z < MZ - 1) result.push([-1, -1, 1]);
                if (x > 0 && y < MY - 1 && z > 0) result.push([-1, 1, -1]);
                if (x > 0 && y < MY - 1 && z < MZ - 1) result.push([-1, 1, 1]);
                if (x < MX - 1 && y > 0 && z > 0) result.push([1, -1, -1]);
                if (x < MX - 1 && y > 0 && z < MZ - 1) result.push([1, -1, 1]);
                if (x < MX - 1 && y < MY - 1 && z > 0) result.push([1, 1, -1]);
                if (x < MX - 1 && y < MY - 1 && z < MZ - 1)
                    result.push([1, 1, 1]);
            }
        }

        return result;
    }
}
