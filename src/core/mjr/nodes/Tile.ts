import {alea} from 'seedrandom';
import {Grid} from '../grid';
import {Loader} from '../loader';
import {Array2D, Array3Dflat, BoolArray3D} from '../helpers/datastructures';
import {Helper} from '../helpers/helper';
import {SymmetryHelper} from '../helpers/symmetry';

import {WFCNode} from './WFC';

const FALSE = (_) => false;

export class TileNode extends WFCNode {
	protected static state_rng = alea('', {entropy: true});

	private tiledata: Uint8Array[];

	private S: number;
	private SZ: number;
	private overlap: number;
	private overlapz: number;

	private votes: Array2D<Uint32Array>;

	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		this.periodic = elem.getAttribute('periodic') === 'True';
		this.name = elem.getAttribute('tileset');
		const tilesname = elem.getAttribute('tiles') || this.name;
		this.overlap = parseInt(elem.getAttribute('overlap')) || 0;
		this.overlapz = parseInt(elem.getAttribute('overlapz')) || 0;

		const filepath = `resources/tilesets/${this.name}.xml`;
		const root = (await Loader.xml(filepath)).elem;
		const fullSymmetry = root.getAttribute('fullSymmetry') === 'True';
		const eFirstTile = Helper.matchTag(Helper.matchTag(root, 'tiles'), 'tile');
		const firstFileName = `${tilesname}/${eFirstTile.getAttribute('name')}.vox`;
		const [firstData, S, SY, SZ] = await Loader.vox(`resources/tilesets/${firstFileName}`);

		if (!firstData) {
			console.error(`Failed to load tileset ${firstFileName}`);
			return false;
		}
		if (S !== SY) {
			console.error(`Tiles should be square shaped: ${S} != ${SY}`);
			return false;
		}
		if (fullSymmetry && S != SZ) {
			console.error(`Tiles should be cube shaped for full symmetry option: ${S} != ${SZ}`);
			return false;
		}

		this.S = S;
		this.SZ = SZ;

		const {overlap, overlapz} = this;
		this.newgrid = Grid.build(
			elem,
			(S - overlap) * grid.MX + overlap,
			(S - overlap) * grid.MY + overlap,
			(SZ - overlapz) * grid.MZ + overlapz
		);
		if (!this.newgrid) return false;

		this.votes = new Array2D(Uint32Array, this.newgrid.C, S * S * SZ, 0);

		this.tiledata = [];
		const positions: Map<string, Uint8Array> = new Map();

		const newtile = (f: (x: number, y: number, z: number) => number) => Array3Dflat(Uint8Array, S, S, SZ, f);

		const zRotate = (p: Uint8Array) => newtile((x, y, z) => p[y + (S - 1 - x) * S + z * S * S]);
		const yRotate = (p: Uint8Array) => newtile((x, y, z) => p[z + y * S + (S - 1 - x) * S * S]);
		const xRotate = (p: Uint8Array) => newtile((x, y, z) => p[x + z * S + (S - 1 - y) * S * S]);
		const xReflect = (p: Uint8Array) => newtile((x, y, z) => p[S - 1 - x + y * S + z * S * S]);
		const yReflect = (p: Uint8Array) => newtile((x, y, z) => p[x + (S - 1 - y) * S + z * S * S]);
		const zReflect = (p: Uint8Array) => newtile((x, y, z) => p[x + y * S + (S - 1 - z) * S * S]);

		const uniques: number[] = [];
		const etiles = [...Helper.matchTags(Helper.matchTag(root, 'tiles'), 'tile')];

		const tasks = etiles.map(async (etile) => {
			const tilename = etile.getAttribute('name');
			const weight = parseFloat(etile.getAttribute('weight')) || 1;

			const filename = `resources/tilesets/${tilesname}/${tilename}.vox`;
			const [vox] = await Loader.vox(filename);
			if (!vox) {
				console.error(`Failed to load tile ${filename}`);
				return null;
			}
			const [flatTile, C] = Helper.ords(vox, uniques);
			if (C > this.newgrid.C) {
				console.error(`There're more than ${this.newgrid.C} colors in vox files`);
				return null;
			}

			return {tilename, flatTile, weight};
		});

		const result = await Promise.all(tasks);
		if (result.some((loaded) => !loaded)) return false;

		const namedTileData: Map<string, Uint8Array[]> = new Map();
		const tempStationary: number[] = [];
		let ind = 0;

		for (const {tilename, flatTile, weight} of result) {
			const localdata = fullSymmetry
				? SymmetryHelper.cubeSymmetries(flatTile, zRotate, yRotate, xReflect, Helper.compareArr)
				: SymmetryHelper.squareSymmetries(flatTile, zRotate, xReflect, Helper.compareArr);

			const position = new Uint8Array(128);
			namedTileData.set(tilename, localdata);
			for (const p of localdata) {
				this.tiledata.push(p);
				tempStationary.push(weight);
				position[ind] = 1;
				ind++;
			}
			positions.set(tilename, position);
		}

		const P = (this.P = this.tiledata.length);
		console.log(`P = ${this.P}`);
		this.weights = new Float64Array(tempStationary);

		this.map = new Map();
		for (const erule of Helper.childrenByTag(elem, 'rule')) {
			// console.log(erule);

			const input = erule.getAttribute('in').charCodeAt(0);
			const outputs = erule.getAttribute('out').split('|');
			const position = new Uint8Array(P);
			for (const s of outputs) {
				const array = positions.get(s);
				if (!array) {
					console.error(elem, `unknown tilename ${s}`);
					return false;
				}
				for (let p = 0; p < P; p++) if (array[p]) position[p] = 1;
			}
			this.map.set(grid.values.get(input), position);
		}

		if (!this.map.has(0)) {
			this.map.set(0, new Uint8Array(new Array(P).fill(1)));
		}

		const tempPropagator = new BoolArray3D(P, P, 6, false);

		const index = (p: Uint8Array) => {
			for (let i = 0; i < this.tiledata.length; i++) if (Helper.compareArr(p, this.tiledata[i])) return i;
			return -1;
		};

		const last = (attribute: string) => attribute?.split(' ').slice(-1)[0];
		const tile = (attribute: string) => {
			const code = attribute.split(' ');
			const action = code.length === 2 ? code[0] : '';
			let starttile = namedTileData.get(last(attribute))[0];
			for (let i = action.length - 1; i >= 0; i--) {
				const sym = action.charAt(i);
				if (sym === 'x') starttile = xRotate(starttile);
				else if (sym === 'y') starttile = yRotate(starttile);
				else if (sym === 'z') starttile = zRotate(starttile);
				else {
					console.error(`unknown symmetry ${sym}`);
					return null;
				}
			}
			return starttile;
		};

		const tilenames = etiles.map((x) => x.getAttribute('name'));
		tilenames.push(null);
		// console.log(tilenames);

		for (const en of Helper.matchTags(Helper.matchTag(root, 'neighbors'), 'neighbor')) {
			if (fullSymmetry) {
				const left = en.getAttribute('left');
				const right = en.getAttribute('right');
				if (!tilenames.includes(last(left)) || !tilenames.includes(last(right))) {
					console.error(
						en,
						`unknown tile "${last(left)}" or "${last(right)}" ("${left}", "${right}")`,
						tilenames
					);
					return false;
				}

				const ltile = tile(left),
					rtile = tile(right);
				if (!ltile || !rtile) return false;

				const lsym = SymmetryHelper.squareSymmetries(ltile, xRotate, yReflect, FALSE);
				const rsym = SymmetryHelper.squareSymmetries(rtile, xRotate, yReflect, FALSE);

				for (let i = 0; i < lsym.length; i++) {
					tempPropagator.set(index(rsym[i]), index(lsym[i]), 0, true);
					tempPropagator.set(index(xReflect(lsym[i])), index(xReflect(rsym[i])), 0, true);
				}

				const dtile = zRotate(ltile);
				const utile = zRotate(rtile);

				var dsym = SymmetryHelper.squareSymmetries(dtile, yRotate, zReflect, FALSE);
				var usym = SymmetryHelper.squareSymmetries(utile, yRotate, zReflect, FALSE);

				for (let i = 0; i < dsym.length; i++) {
					tempPropagator.set(index(usym[i]), index(dsym[i]), 1, true);
					tempPropagator.set(index(yReflect(dsym[i])), index(yReflect(usym[i])), 1, true);
				}

				const btile = yRotate(ltile);
				const ttile = yRotate(rtile);

				var bsym = SymmetryHelper.squareSymmetries(btile, zRotate, xReflect, FALSE);
				var tsym = SymmetryHelper.squareSymmetries(ttile, zRotate, xReflect, FALSE);

				for (let i = 0; i < bsym.length; i++) {
					tempPropagator.set(index(tsym[i]), index(bsym[i]), 4, true);
					tempPropagator.set(index(zReflect(bsym[i])), index(zReflect(tsym[i])), 4, true);
				}
			} else if (en.getAttribute('left')) {
				const left = en.getAttribute('left');
				const right = en.getAttribute('right');

				if (!tilenames.includes(last(left)) || !tilenames.includes(last(right))) {
					console.error(
						en,
						`unknown tile "${last(left)}" or "${last(right)}" ("${left}", "${right}")`,
						tilenames
					);
					return false;
				}

				const ltile = tile(left);
				const rtile = tile(right);
				if (!ltile || !rtile) return false;

				tempPropagator.set(index(rtile), index(ltile), 0, true);
				tempPropagator.set(index(yReflect(rtile)), index(yReflect(ltile)), 0, true);
				tempPropagator.set(index(xReflect(ltile)), index(xReflect(rtile)), 0, true);
				tempPropagator.set(index(yReflect(xReflect(ltile))), index(yReflect(xReflect(rtile))), 0, true);

				const dtile = zRotate(ltile);
				const utile = zRotate(rtile);

				tempPropagator.set(index(utile), index(dtile), 1, true);
				tempPropagator.set(index(xReflect(utile)), index(xReflect(dtile)), 1, true);
				tempPropagator.set(index(yReflect(dtile)), index(yReflect(utile)), 1, true);
				tempPropagator.set(index(xReflect(yReflect(dtile))), index(xReflect(yReflect(utile))), 1, true);
			} else {
				const top = en.getAttribute('top');
				const bottom = en.getAttribute('bottom');
				if (!tilenames.includes(last(top)) || !tilenames.includes(last(bottom))) {
					console.error(
						en,
						`unknown tile "${last(top)}" or "${last(bottom)}" ("${top}", "${bottom}")`,
						tilenames
					);
					return false;
				}

				const ttile = tile(top);
				const btile = tile(bottom);
				if (!ttile || !btile) return false;

				const tsym = SymmetryHelper.squareSymmetries(ttile, zRotate, xReflect, FALSE);
				const bsym = SymmetryHelper.squareSymmetries(btile, zRotate, xReflect, FALSE);

				for (let i = 0; i < tsym.length; i++) tempPropagator.set(index(tsym[i]), index(bsym[i]), 4, true);
			}
		}

		for (let p2 = 0; p2 < P; p2++) {
			for (let p1 = 0; p1 < P; p1++) {
				tempPropagator.set(p1, p2, 2, tempPropagator.get(p2, p1, 0));
				tempPropagator.set(p1, p2, 3, tempPropagator.get(p2, p1, 1));
				tempPropagator.set(p1, p2, 5, tempPropagator.get(p2, p1, 4));
			}
		}

		const sparsePropagator: number[][][] = Array.from({length: 6}, (_) => Array.from({length: P}, (_) => []));

		this.propagator = Array.from({length: 6}, (_, d) =>
			Array.from({length: P}, (_, p1) => {
				const sp = sparsePropagator[d][p1];

				for (let p2 = 0; p2 < P; p2++) if (tempPropagator.get(p2, p1, d)) sp.push(p2);
				return new Int32Array(sp);
			})
		);

		return await super.load(elem, parentSymmetry, grid);
	}

	public override updateState() {
		const {newgrid, grid, wave, S, SZ, P, tiledata, overlap, overlapz, votes} = this;

		const rng = TileNode.state_rng;

		for (let z = 0; z < grid.MZ; z++)
			for (let y = 0; y < grid.MY; y++)
				for (let x = 0; x < grid.MX; x++) {
					const w = wave.data.row(x + y * grid.MX + z * grid.MX * grid.MY);

					votes.fill(0);

					for (let t = 0; t < P; t++)
						if (w.get(t)) {
							const tile = tiledata[t];
							for (let dz = 0; dz < SZ; dz++)
								for (let dy = 0; dy < S; dy++)
									for (let dx = 0; dx < S; dx++) {
										const di = dx + dy * S + dz * S * S;
										votes.incre(tile[di], di);
									}
						}

					for (let dz = 0; dz < SZ; dz++)
						for (let dy = 0; dy < S; dy++)
							for (let dx = 0; dx < S; dx++) {
								const v = votes.row(dx + dy * S + dz * S * S);
								let max = -1.0;
								let argmax = 0xff;
								for (let c = 0; c < v.length; c++) {
									const vote = v[c] + 0.1 * rng.double();
									if (vote > max) {
										argmax = c;
										max = vote;
									}
								}
								let sx = x * (S - overlap) + dx;
								let sy = y * (S - overlap) + dy;
								let sz = z * (SZ - overlapz) + dz;
								newgrid.state[sx + sy * newgrid.MX + sz * newgrid.MX * newgrid.MY] = argmax;
							}
				}
	}
}
