'use strict';

//
//
// from
// https://github.com/manthrax/THREE-CSGMesh
//

import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix3} from 'three/src/math/Matrix3';
import {Matrix4} from 'three/src/math/Matrix4';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {Mesh} from 'three/src/objects/Mesh';

import {CSG, Vertex, Vector, Polygon} from './csg-lib.js';

//import {Geometry} from "../three.js-dev/examples/jsm/deprecated/Geometry.js";

CSG.fromGeometry = function (geom, objectIndex) {
	//   if (geom.isBufferGeometry)
	//        geom = new Geometry().fromBufferGeometry(geom)
	let polys = [];
	if (geom.isGeometry) {
		let fs = geom.faces;
		let vs = geom.vertices;
		let fm = ['a', 'b', 'c'];
		for (let i = 0; i < fs.length; i++) {
			let f = fs[i];
			let vertices = [];
			for (let j = 0; j < 3; j++)
				vertices.push(new Vertex(vs[f[fm[j]]], f.vertexNormals[j], geom.faceVertexUvs[0][i][j]));
			polys.push(new Polygon(vertices, objectIndex));
		}
	} else if (geom.isBufferGeometry) {
		let vertices, normals, uvs;
		let posattr = geom.attributes.position;
		let normalattr = geom.attributes.normal;
		let uvattr = geom.attributes.uv;
		let colorattr = geom.attributes.color;
		let index;
		if (geom.index) index = geom.index.array;
		else {
			index = new Array((posattr.array.length / posattr.itemSize) | 0);
			for (let i = 0; i < index.length; i++) index[i] = i;
		}
		let triCount = (index.length / 3) | 0;
		polys = new Array(triCount);
		for (let i = 0, pli = 0, l = index.length; i < l; i += 3, pli++) {
			let vertices = new Array(3);
			for (let j = 0; j < 3; j++) {
				let vi = index[i + j];
				let vp = vi * 3;
				let vt = vi * 2;
				let x = posattr.array[vp];
				let y = posattr.array[vp + 1];
				let z = posattr.array[vp + 2];
				let nx = normalattr.array[vp];
				let ny = normalattr.array[vp + 1];
				let nz = normalattr.array[vp + 2];
				let u = uvattr.array[vt];
				let v = uvattr.array[vt + 1];
				vertices[j] = new Vertex(
					{
						x,
						y,
						z,
					},
					{
						x: nx,
						y: ny,
						z: nz,
					},
					{
						x: u,
						y: v,
						z: 0,
					},
					colorattr && {x: colorattr.array[vt], y: colorattr.array[vt + 1], z: colorattr.array[vt + 2]}
				);
			}
			polys[pli] = new Polygon(vertices, objectIndex);
		}
	} else console.error('Unsupported CSG input type:' + geom.type);
	return CSG.fromPolygons(polys);
};

let ttvv0 = new Vector3();
let tmpm3 = new Matrix3();
CSG.fromMesh = function (mesh, objectIndex) {
	let csg = CSG.fromGeometry(mesh.geometry, objectIndex);
	tmpm3.getNormalMatrix(mesh.matrix);
	for (let i = 0; i < csg.polygons.length; i++) {
		let p = csg.polygons[i];
		for (let j = 0; j < p.vertices.length; j++) {
			let v = p.vertices[j];
			v.pos.copy(ttvv0.copy(v.pos).applyMatrix4(mesh.matrix));
			v.normal.copy(ttvv0.copy(v.normal).applyMatrix3(tmpm3));
		}
	}
	return csg;
};

let nbuf3 = (ct) => {
	return {
		top: 0,
		array: new Float32Array(ct),
		write: function (v) {
			this.array[this.top++] = v.x;
			this.array[this.top++] = v.y;
			this.array[this.top++] = v.z;
		},
	};
};
let nbuf2 = (ct) => {
	return {
		top: 0,
		array: new Float32Array(ct),
		write: function (v) {
			this.array[this.top++] = v.x;
			this.array[this.top++] = v.y;
		},
	};
};

CSG.toMesh = function (csg, toMatrix, toMaterial) {
	let ps = csg.polygons;
	let geom;
	let g2;
	if (1) {
		//BufferGeometry path
		let triCount = 0;
		ps.forEach((p) => (triCount += p.vertices.length - 2));
		geom = new BufferGeometry();

		let vertices = nbuf3(triCount * 3 * 3);
		let normals = nbuf3(triCount * 3 * 3);
		let uvs = nbuf2(triCount * 2 * 3);
		let colors;
		let grps = [];
		ps.forEach((p) => {
			let pvs = p.vertices;
			let pvlen = pvs.length;
			if (p.shared !== undefined) {
				if (!grps[p.shared]) grps[p.shared] = [];
			}
			if (pvlen && pvs[0].color !== undefined) {
				if (!colors) colors = nbuf3(triCount * 3 * 3);
			}
			for (let j = 3; j <= pvlen; j++) {
				p.shared !== undefined &&
					grps[p.shared].push(vertices.top / 3, vertices.top / 3 + 1, vertices.top / 3 + 2);
				vertices.write(pvs[0].pos);
				vertices.write(pvs[j - 2].pos);
				vertices.write(pvs[j - 1].pos);
				normals.write(pvs[0].normal);
				normals.write(pvs[j - 2].normal);
				normals.write(pvs[j - 1].normal);
				uvs.write(pvs[0].uv);
				uvs.write(pvs[j - 2].uv);
				uvs.write(pvs[j - 1].uv);
				colors &&
					(colors.write(pvs[0].color) || colors.write(pvs[j - 2].color) || colors.write(pvs[j - 1].color));
			}
		});
		geom.setAttribute('position', new BufferAttribute(vertices.array, 3));
		geom.setAttribute('normal', new BufferAttribute(normals.array, 3));
		geom.setAttribute('uv', new BufferAttribute(uvs.array, 2));
		colors && geom.setAttribute('color', new BufferAttribute(colors.array, 3));
		if (grps.length) {
			let index = [];
			let gbase = 0;
			for (let gi = 0; gi < grps.length; gi++) {
				geom.addGroup(gbase, grps[gi].length, gi);
				gbase += grps[gi].length;
				index = index.concat(grps[gi]);
			}
			geom.setIndex(index);
		}
		g2 = geom;
	}

	let inv = new Matrix4().copy(toMatrix).invert();
	geom.applyMatrix4(inv);
	geom.computeBoundingSphere();
	geom.computeBoundingBox();
	let m = new Mesh(geom, toMaterial);
	m.matrix.copy(toMatrix);
	m.matrix.decompose(m.position, m.quaternion, m.scale);
	m.rotation.setFromQuaternion(m.quaternion);
	m.updateMatrixWorld();
	m.castShadow = m.receiveShadow = true;
	return m;
};

export {CSG};
