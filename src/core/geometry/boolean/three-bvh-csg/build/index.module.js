import { Vector3, Mesh, Matrix4, Ray, Triangle, Vector4, Line3, DoubleSide, Plane, Matrix3, BufferAttribute, BufferGeometry, Group, Color, MeshPhongMaterial, MathUtils, LineSegments, LineBasicMaterial, InstancedMesh, SphereBufferGeometry, MeshBasicMaterial } from 'three';
import { MeshBVH, ExtendedTriangle } from 'three-mesh-bvh';

const _vertices = [ new Vector3(), new Vector3(), new Vector3() ];

function hashNumber( v ) {

	return ~ ~ ( v * 1e4 );

}

function hashVertex( v ) {

	return `${ hashNumber( v.x ) },${ hashNumber( v.y ) },${ hashNumber( v.z ) }`;

}

class HalfEdgeMap {

	constructor( geometry = null ) {

		this.data = null;
		this.unmatchedEdges = null;
		this.matchedEdges = null;
		this.useDrawRange = true;

		if ( geometry ) {

			this.updateFrom( geometry );

		}

	}

	getSiblingTriangleIndex( triIndex, edgeIndex ) {

		const otherIndex = this.data[ triIndex * 3 + edgeIndex ];
		return otherIndex === - 1 ? - 1 : ~ ~ ( otherIndex / 3 );

	}

	getSiblingEdgeIndex( triIndex, edgeIndex ) {

		const otherIndex = this.data[ triIndex * 3 + edgeIndex ];
		return otherIndex === - 1 ? - 1 : ( otherIndex % 3 );

	}

	updateFrom( geometry ) {

		// runs on the assumption that there is a 1 : 1 match of edges
		const map = new Map();

		// attributes
		const { attributes } = geometry;
		const indexAttr = geometry.index;
		const posAttr = attributes.position;

		// get the potential number of triangles
		let triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
		const maxTriCount = triCount;

		// get the real number of triangles from the based on the draw range
		let offset = 0;
		if ( this.useDrawRange ) {

			offset = geometry.drawRange.start;
			if ( geometry.drawRange.count !== Infinity ) {

				triCount = ~ ~ ( geometry.drawRange.count / 3 );

			}

		}

		// initialize the connectivity buffer - 1 means no connectivity
		let data = this.data;
		if ( ! data || data.length < 3 * maxTriCount ) {

			data = new Int32Array( 3 * maxTriCount );

		}

		data.fill( - 1 );

		// iterate over all triangles
		let unmatchedEdges = 0;
		let matchedEdges = 0;
		for ( let i = 0; i < triCount; i ++ ) {

			const i3 = 3 * i + offset;
			for ( let e = 0; e < 3; e ++ ) {

				let i0 = i3 + e;
				if ( indexAttr ) {

					i0 = indexAttr.getX( i0 );

				}

				_vertices[ e ].fromBufferAttribute( posAttr, i0 );

			}

			for ( let e = 0; e < 3; e ++ ) {

				const nextE = ( e + 1 ) % 3;
				const _vec0 = _vertices[ e ];
				const _vec1 = _vertices[ nextE ];

				const vh0 = hashVertex( _vec0 );
				const vh1 = hashVertex( _vec1 );

				const reverseHash = `${ vh1 }_${ vh0 }`;
				if ( map.has( reverseHash ) ) {

					// create a reference between the two triangles and clear the hash
					const otherIndex = map.get( reverseHash );
					data[ i3 + e ] = otherIndex;
					data[ otherIndex ] = i3 + e;
					map.delete( reverseHash );
					unmatchedEdges --;
					matchedEdges ++;

				} else {

					// save the triangle and triangle edge index captured in one value
					// triIndex = ~ ~ ( i0 / 3 );
					// edgeIndex = i0 % 3;
					const hash = `${ vh0 }_${ vh1 }`;
					map.set( hash, i3 + e );
					unmatchedEdges ++;

				}

			}

		}

		this.matchedEdges = matchedEdges;
		this.unmatchedEdges = unmatchedEdges;
		this.data = data;

	}

}

function areSharedArrayBuffersSupported() {

	return typeof SharedArrayBuffer !== 'undefined';

}

function convertToSharedArrayBuffer( array ) {

	if ( array.buffer instanceof SharedArrayBuffer ) {

		return array;

	}

	const cons = array.constructor;
	const buffer = array.buffer;
	const sharedBuffer = new SharedArrayBuffer( buffer.byteLength );

	const uintArray = new Uint8Array( buffer );
	const sharedUintArray = new Uint8Array( sharedBuffer );
	sharedUintArray.set( uintArray, 0 );

	return new cons( sharedBuffer );

}

class Brush extends Mesh {

	constructor( ...args ) {

		super( ...args );

		this.isBrush = true;
		this._previousMatrix = new Matrix4();
		this._previousMatrix.elements.fill( 0 );

	}

	markUpdated() {

		this._previousMatrix.copy( this.matrix );

	}

	isDirty() {

		const { matrix, _previousMatrix } = this;
		const el1 = matrix.elements;
		const el2 = _previousMatrix.elements;
		for ( let i = 0; i < 16; i ++ ) {

			if ( el1[ i ] !== el2[ i ] ) {

				return true;

			}

		}

		return false;

	}

	prepareGeometry() {

		// generate shared array buffers
		const geometry = this.geometry;
		const attributes = geometry.attributes;
		if ( areSharedArrayBuffersSupported() ) {

			for ( const key in attributes ) {

				const attribute = attributes[ key ];
				if ( attribute.isInterleavedBufferAttribute ) {

					throw new Error( 'Brush: InterleavedBufferAttributes are not supported.' );

				}

				attribute.array = convertToSharedArrayBuffer( attribute.array );

			}

		}

		// generate bounds tree
		if ( ! geometry.boundsTree ) {

			geometry.boundsTree = new MeshBVH( geometry, { maxLeafTris: 3 } );
			if ( geometry.halfEdges ) {

				geometry.halfEdges.updateFrom( geometry );

			}

		}

		// generate half edges
		if ( ! geometry.halfEdges ) {

			geometry.halfEdges = new HalfEdgeMap( geometry );

		}

		// save group indices for materials
		if ( ! geometry.groupIndices ) {

			const triCount = geometry.index.count / 3;
			const array = new Uint16Array( triCount );
			const groups = geometry.groups;
			for ( let i = 0, l = groups.length; i < l; i ++ ) {

				const { start, count } = groups[ i ];
				for ( let g = start / 3, lg = ( start + count ) / 3; g < lg; g ++ ) {

					array[ g ] = i;

				}

			}

			geometry.groupIndices = array;

		}

	}

	disposeCacheData() {

		const { geometry } = this;
		geometry.halfEdges = null;
		geometry.boundsTree = null;
		geometry.groupIndices = null;

	}

}

class IntersectionMap {

	constructor() {

		this.intersectionSet = {};
		this.ids = [];

	}

	add( id, intersectionId ) {

		const { intersectionSet, ids } = this;
		if ( ! intersectionSet[ id ] ) {

			intersectionSet[ id ] = [];
			ids.push( id );

		}

		intersectionSet[ id ].push( intersectionId );

	}

}

const ADDITION = 0;
const SUBTRACTION = 1;
const DIFFERENCE = 3;
const INTERSECTION = 4;

const _ray = new Ray();
const _matrix$2 = new Matrix4();
const _tri$1 = new Triangle();
const _vec3 = new Vector3();
const _vec4a = new Vector4();
const _vec4b = new Vector4();
const _vec4c = new Vector4();
const _vec4_0 = new Vector4();
const _vec4_1 = new Vector4();
const _vec4_2 = new Vector4();
const _edge$1 = new Line3();
const JITTER_EPSILON = 1e-8;

const COPLANAR = 0;
const BACK_SIDE = - 1;
const FRONT_SIDE = 1;

const INVERT_TRI = 0;
const ADD_TRI = 1;
const SKIP_TRI = 2;

let _debugContext = null;
function setDebugContext( debugData ) {

	_debugContext = debugData;

}

function getHitSide( tri, bvh ) {

	// random function that returns [ - 0.5, 0.5 ];
	function rand() {

		return Math.random() - 0.5;

	}

	// get the ray the check the triangle for
	_ray.origin.copy( tri.a ).add( tri.b ).add( tri.c ).multiplyScalar( 1 / 3 );
	tri.getNormal( _ray.direction );

	const total = 3;
	let count = 0;
	let minDistance = Infinity;
	for ( let i = 0; i < total; i ++ ) {

		// jitter the ray slightly
		_ray.direction.x += rand() * JITTER_EPSILON;
		_ray.direction.y += rand() * JITTER_EPSILON;
		_ray.direction.z += rand() * JITTER_EPSILON;

		// check if the ray hit the backside
		const hit = bvh.raycastFirst( _ray, DoubleSide );
		let hitBackSide = Boolean( hit && _ray.direction.dot( hit.face.normal ) > 0 );
		if ( hitBackSide ) {

			count ++;

		}

		if ( hit !== null ) {

			minDistance = Math.min( minDistance, hit.distance );

		}

		// if our current casts meet our requirements then early out
		if ( minDistance === 0 || count / total > 0.5 || ( i - count + 1 ) / total > 0.5 ) {

			break;

		}

	}

	// if we're right up against another face then we're coplanar
	if ( minDistance === 0 ) {

		return COPLANAR;

	} else {

		return count / total > 0.5 ? BACK_SIDE : FRONT_SIDE;

	}

}

// returns the intersected triangles and returns objects mapping triangle indices to
// the other triangles intersected
function collectIntersectingTriangles( a, b ) {

	const aIntersections = new IntersectionMap();
	const bIntersections = new IntersectionMap();

	_matrix$2
		.copy( a.matrixWorld )
		.invert()
		.multiply( b.matrixWorld );

	a.geometry.boundsTree.bvhcast( b.geometry.boundsTree, _matrix$2, {

		intersectsTriangles( triangleA, triangleB, ia, ib ) {

			if ( triangleA.intersectsTriangle( triangleB, _edge$1 ) && _edge$1.distance() > 1e-5 ) {

				aIntersections.add( ia, ib );
				bIntersections.add( ib, ia );

				if ( _debugContext ) {

					_debugContext.addEdge( _edge$1 );
					_debugContext.addIntersectingTriangles( ia, triangleA, ib, triangleB );

				}

			}

			return false;

		}

	} );

	return { aIntersections, bIntersections };

}

// Add the barycentric interpolated values fro the triangle into the new attribute data
function appendAttributeFromTriangle(
	triIndex,
	baryCoordTri,
	geometry,
	matrixWorld,
	normalMatrix,
	attributeInfo,
	invert = false,
) {

	const attributes = geometry.attributes;
	const indexAttr = geometry.index;
	const i3 = triIndex * 3;
	const i0 = indexAttr.getX( i3 + 0 );
	const i1 = indexAttr.getX( i3 + 1 );
	const i2 = indexAttr.getX( i3 + 2 );

	for ( const key in attributeInfo ) {

		// check if the key we're asking for is in the geometry at all
		const attr = attributes[ key ];
		const arr = attributeInfo[ key ];
		if ( ! ( key in attributes ) ) {

			throw new Error( `CSG Operations: Attribute ${ key } not available on geometry.` );

		}

		// handle normals and positions specially because they require transforming
		// TODO: handle tangents
		const itemSize = attr.itemSize;
		if ( key === 'position' ) {

			_tri$1.a.fromBufferAttribute( attr, i0 ).applyMatrix4( matrixWorld );
			_tri$1.b.fromBufferAttribute( attr, i1 ).applyMatrix4( matrixWorld );
			_tri$1.c.fromBufferAttribute( attr, i2 ).applyMatrix4( matrixWorld );

			pushBarycoordInterpolatedValues( _tri$1.a, _tri$1.b, _tri$1.c, baryCoordTri, 3, arr, invert );

		} else if ( key === 'normal' ) {

			_tri$1.a.fromBufferAttribute( attr, i0 ).applyNormalMatrix( normalMatrix );
			_tri$1.b.fromBufferAttribute( attr, i1 ).applyNormalMatrix( normalMatrix );
			_tri$1.c.fromBufferAttribute( attr, i2 ).applyNormalMatrix( normalMatrix );

			if ( invert ) {

				_tri$1.a.multiplyScalar( - 1 );
				_tri$1.b.multiplyScalar( - 1 );
				_tri$1.c.multiplyScalar( - 1 );

			}

			pushBarycoordInterpolatedValues( _tri$1.a, _tri$1.b, _tri$1.c, baryCoordTri, 3, arr, invert, true );

		} else {

			_vec4a.fromBufferAttribute( attr, i0 );
			_vec4b.fromBufferAttribute( attr, i1 );
			_vec4c.fromBufferAttribute( attr, i2 );

			pushBarycoordInterpolatedValues( _vec4a, _vec4b, _vec4c, baryCoordTri, itemSize, arr, invert );

		}

	}

}

// Append all the values of the attributes for the triangle onto the new attribute arrays
function appendAttributesFromIndices(
	i0,
	i1,
	i2,
	attributes,
	matrixWorld,
	normalMatrix,
	attributeInfo,
	invert = false,
) {

	appendAttributeFromIndex( i0, attributes, matrixWorld, normalMatrix, attributeInfo, invert );
	appendAttributeFromIndex( i1, attributes, matrixWorld, normalMatrix, attributeInfo, invert );
	appendAttributeFromIndex( i2, attributes, matrixWorld, normalMatrix, attributeInfo, invert );

}

// Returns the triangle to add when performing an operation
function getOperationAction( operation, hitSide, invert = false ) {

	switch ( operation ) {

		case ADDITION:
			if ( hitSide === FRONT_SIDE || ( hitSide === COPLANAR && invert ) ) {

				return ADD_TRI;

			}

			break;
		case SUBTRACTION:

			if ( invert ) {

				if ( hitSide === BACK_SIDE ) {

					return INVERT_TRI;

				}

			} else {

				if ( hitSide === FRONT_SIDE ) {

					return ADD_TRI;

				}

			}

			break;
		case DIFFERENCE:
			if ( hitSide === BACK_SIDE ) {

				return INVERT_TRI;

			} else if ( hitSide === FRONT_SIDE ) {

				return ADD_TRI;

			}

		case INTERSECTION:
			if ( hitSide === BACK_SIDE || ( hitSide === COPLANAR && invert ) ) {

				return ADD_TRI;


			}

			break;
		default:
			throw new Error( `Unrecognized CSG operation enum "${ operation }".` );

	}

	return SKIP_TRI;

}

// takes a set of barycentric values in the form of a triangle, a set of vectors, number of components,
// and whether to invert the result and pushes the new values onto the provided attribute array
function pushBarycoordInterpolatedValues( v0, v1, v2, baryCoordTri, itemSize, attrArr, invert = false, normalize = false ) {

	// adds the appropriate number of values for the vector onto the array
	const addValues = v => {

		attrArr.push( v.x );
		if ( itemSize > 1 ) attrArr.push( v.y );
		if ( itemSize > 2 ) attrArr.push( v.z );
		if ( itemSize > 3 ) attrArr.push( v.w );

	};

	// barycentric interpolate the first component
	_vec4_0.set( 0, 0, 0, 0 )
		.addScaledVector( v0, baryCoordTri.a.x )
		.addScaledVector( v1, baryCoordTri.a.y )
		.addScaledVector( v2, baryCoordTri.a.z );

	_vec4_1.set( 0, 0, 0, 0 )
		.addScaledVector( v0, baryCoordTri.b.x )
		.addScaledVector( v1, baryCoordTri.b.y )
		.addScaledVector( v2, baryCoordTri.b.z );

	_vec4_2.set( 0, 0, 0, 0 )
		.addScaledVector( v0, baryCoordTri.c.x )
		.addScaledVector( v1, baryCoordTri.c.y )
		.addScaledVector( v2, baryCoordTri.c.z );

	if ( normalize ) {

		_vec4_0.normalize();
		_vec4_1.normalize();
		_vec4_2.normalize();

	}

	// if the face is inverted then add the values in an inverted order
	addValues( _vec4_0 );

	if ( invert ) {

		addValues( _vec4_2 );
		addValues( _vec4_1 );

	} else {

		addValues( _vec4_1 );
		addValues( _vec4_2 );

	}

}

// Adds the values for the given vertex index onto the new attribute arrays
function appendAttributeFromIndex(
	index,
	attributes,
	matrixWorld,
	normalMatrix,
	attributeInfo,
	invert = false,
) {

	for ( const key in attributeInfo ) {

		// check if the key we're asking for is in the geometry at all
		const attr = attributes[ key ];
		const arr = attributeInfo[ key ];
		if ( ! ( key in attributes ) ) {

			throw new Error( `CSG Operations: Attribute ${ key } no available on geometry.` );

		}

		// specially handle the position and normal attributes because they require transforms
		// TODO: handle tangents
		const itemSize = attr.itemSize;
		if ( key === 'position' ) {

			_vec3.fromBufferAttribute( attr, index ).applyMatrix4( matrixWorld );
			arr.push( _vec3.x, _vec3.y, _vec3.z );

		} else if ( key === 'normal' ) {

			_vec3.fromBufferAttribute( attr, index ).applyNormalMatrix( normalMatrix );
			if ( invert ) {

				_vec3.multiplyScalar( - 1 );

			}

			arr.push( _vec3.x, _vec3.y, _vec3.z );

		} else {

			arr.push( attr.getX( index ) );
			if ( itemSize > 1 ) arr.push( attr.getY( index ) );
			if ( itemSize > 2 ) arr.push( attr.getZ( index ) );
			if ( itemSize > 3 ) arr.push( attr.getW( index ) );

		}

	}

}

const EPSILON = 1e-14;
const COPLANAR_EPSILON = 1e-7;
const _edge = new Line3();
const _foundEdge = new Line3();
const _vec$1 = new Vector3();
const _planeNormal = new Vector3();
const _plane$1 = new Plane();
const _exTriangle = new ExtendedTriangle();

function isTriDegenerate( tri ) {

	return tri.a.distanceToSquared( tri.b ) < EPSILON ||
		tri.a.distanceToSquared( tri.c ) < EPSILON ||
		tri.b.distanceToSquared( tri.c ) < EPSILON;

}

// Triangle with fields used to track whether it falls on the same side of all planes
// being used to clip it. Side is set to "null" if it cannot be determined
class CullableTriangle extends Triangle {

	constructor( ...args ) {

		super( ...args );
		this.side = null;
		this.originalSide = null;
		this.coplanarCount = 0;

	}

	init() {

		this.side = null;
		this.originalSide = null;
		this.coplanarCount = 0;

	}

	initFrom( other ) {

		this.side = other.side;
		this.originalSide = other.originalSide;
		this.coplanarCount = other.coplanarCount;

	}

	updateSide( plane, triangle = null, coplanarIndex = - 1 ) {

		if ( this.originalSide !== null && this.side === null ) {

			return;

		}

		// get center and find the side of the plane we're on
		_vec$1
			.copy( this.a )
			.add( this.b )
			.add( this.c )
			.multiplyScalar( 1 / 3 );

		const foundSide = plane.distanceToPoint( _vec$1 ) < 0 ? BACK_SIDE : FRONT_SIDE;
		if ( triangle && coplanarIndex !== - 1 ) {

			if ( foundSide === FRONT_SIDE ) {

				this.coplanarCount ++;
				if ( this.coplanarCount === 3 ) {

					this.side = COPLANAR;

				}

			}

		} else {

			if ( this.originalSide === null ) {

				this.originalSide = foundSide;
				this.side = foundSide;

			}

			if ( foundSide !== this.side ) {

				this.side = null;

			}

		}

	}

}

// A pool of triangles to avoid unnecessary triangle creation
class TrianglePool {

	constructor() {

		this._pool = [];
		this._index = 0;

	}

	getTriangle() {

		if ( this._index >= this._pool.length ) {

			this._pool.push( new CullableTriangle() );

		}

		const result = this._pool[ this._index ++ ];
		result.init();
		return result;

	}

	clear() {

		this._index = 0;

	}

	reset() {

		this._pool.length = 0;
		this._index = 0;

	}

}

// Utility class for splitting triangles
class TriangleSplitter {

	constructor() {

		this.trianglePool = new TrianglePool();
		this.triangles = [];
		this.normal = new Vector3();

	}

	// initialize the class with a triangle
	initialize( tri ) {

		const { triangles, trianglePool, normal } = this;
		triangles.length = 0;
		trianglePool.clear();

		if ( Array.isArray( tri ) ) {

			for ( let i = 0, l = tri.length; i < l; i ++ ) {

				const t = tri[ i ];
				if ( i === 0 ) {

					t.getNormal( normal );

				} else if ( Math.abs( 1.0 - t.getNormal( _vec$1 ).dot( normal ) ) > EPSILON ) {

					throw new Error( 'Triangle Splitter: Cannot initialize with triangles that have different normals.' );

				}

				const poolTri = trianglePool.getTriangle();
				poolTri.copy( t );
				triangles.push( poolTri );

			}

		} else {

			tri.getNormal( normal );

			const poolTri = trianglePool.getTriangle();
			poolTri.copy( tri );
			triangles.push( poolTri );

		}

	}

	// Split the current set of triangles by passing a single triangle in. If the triangle is
	// coplanar it will attempt to split by the triangle edge planes
	splitByTriangle( triangle ) {

		const { normal, triangles } = this;
		triangle.getPlane( _plane$1 );

		if ( Math.abs( 1.0 - Math.abs( _plane$1.normal.dot( normal ) ) ) < COPLANAR_EPSILON ) {

			// if the triangle is coplanar then split by the edge planes
			const arr = [ triangle.a, triangle.b, triangle.c ];
			for ( let i = 0; i < 3; i ++ ) {

				const nexti = ( i + 1 ) % 3;

				const v0 = arr[ i ];
				const v1 = arr[ nexti ];

				_vec$1.subVectors( v1, v0 ).normalize();
				_planeNormal.crossVectors( normal, _vec$1 );
				_plane$1.setFromNormalAndCoplanarPoint( _planeNormal, v0 );

				this.splitByPlane( _plane$1, triangle, i );

			}

			for ( let i = 0, l = triangles.length; i < l; i ++ ) {

				const t = triangles[ i ];
				t.coplanarCount = 0;

			}

		} else {

			// otherwise split by the triangle plane
			this.splitByPlane( _plane$1, triangle );

		}

	}

	// Split the triangles by the given plan. If a triangle is provided then we ensure we
	// intersect the triangle before splitting the plane
	splitByPlane( plane, triangle = null, coplanarIndex = - 1 ) {

		const { triangles, trianglePool } = this;

		// init our triangle to check for intersection
		let splittingTriangle = null;
		if ( triangle !== null ) {

			splittingTriangle = _exTriangle;
			splittingTriangle.copy( triangle );
			splittingTriangle.needsUpdate = true;

		}

		// try to split every triangle in the class
		for ( let i = 0, l = triangles.length; i < l; i ++ ) {

			const tri = triangles[ i ];
			const { a, b, c } = tri;

			// skip the triangle if we don't intersect with it
			if ( splittingTriangle ) {

				if ( ! splittingTriangle.intersectsTriangle( tri, _edge ) || _edge.distance() < 1e-5 ) {

					tri.updateSide( plane, splittingTriangle, coplanarIndex );
					tri.side = null;
					continue;

				}

			}

			let intersects = 0;
			let vertexSplitEnd = - 1;
			let positiveSide = 0;
			let onPlane = 0;
			let coplanarEdge = false;
			const arr = [ a, b, c ];
			for ( let t = 0; t < 3; t ++ ) {

				// get the triangle edge
				const tNext = ( t + 1 ) % 3;
				_edge.start.copy( arr[ t ] );
				_edge.end.copy( arr[ tNext ] );

				// track if the start point sits on the plane or if it's on the positive side of it
				// so we can use that information to determine whether to split later.
				const startDist = plane.distanceToPoint( _edge.start );
				const endDist = plane.distanceToPoint( _edge.end );
				if ( Math.abs( startDist ) < EPSILON ) {

					onPlane ++;

				} else if ( startDist > 0 ) {

					positiveSide ++;

				}

				if ( Math.abs( startDist ) < COPLANAR_EPSILON && Math.abs( endDist ) < COPLANAR_EPSILON ) {

					coplanarEdge = true;

				}

				// double check the end point since the "intersectLine" function sometimes does not
				// return it as an intersection (see issue #28)
				let didIntersect = ! ! plane.intersectLine( _edge, _vec$1 );
				if ( ! didIntersect && Math.abs( endDist ) < EPSILON ) {

					_vec$1.copy( _edge.end );
					didIntersect = true;

				}

				// check if we intersect the plane (ignoring the start point so we don't double count)
				if ( didIntersect && ! ( _vec$1.distanceTo( _edge.start ) < EPSILON ) ) {

					// if we intersect at the end point then we track that point as one that we
					// have to split down the middle
					if ( _vec$1.distanceTo( _edge.end ) < EPSILON ) {

						vertexSplitEnd = t;

					}

					// track the split edge
					if ( intersects === 0 ) {

						_foundEdge.start.copy( _vec$1 );

					} else {

						_foundEdge.end.copy( _vec$1 );

					}

					intersects ++;

				}

			}

			// skip splitting if:
			// - we have two points on the plane then the plane intersects the triangle exactly on an edge
			// - the plane does not intersect on 2 points
			// - the intersection edge is too small
			if ( ! coplanarEdge && onPlane < 2 && intersects === 2 && _foundEdge.distance() > COPLANAR_EPSILON ) {

				if ( vertexSplitEnd !== - 1 ) {

					vertexSplitEnd = ( vertexSplitEnd + 1 ) % 3;

					// we're splitting along a vertex
					let otherVert1 = 0;
					if ( otherVert1 === vertexSplitEnd ) otherVert1 = ( otherVert1 + 1 ) % 3;

					let otherVert2 = otherVert1 + 1;
					if ( otherVert2 === vertexSplitEnd ) otherVert2 = ( otherVert2 + 1 ) % 3;

					const nextTri = trianglePool.getTriangle();
					nextTri.a.copy( arr[ otherVert2 ] );
					nextTri.b.copy( _foundEdge.end );
					nextTri.c.copy( _foundEdge.start );

					if ( ! isTriDegenerate( nextTri ) ) {

						triangles.push( nextTri );
						nextTri.initFrom( tri );
						nextTri.updateSide( plane, splittingTriangle, coplanarIndex );

					}

					tri.a.copy( arr[ otherVert1 ] );
					tri.b.copy( _foundEdge.start );
					tri.c.copy( _foundEdge.end );

					if ( isTriDegenerate( tri ) ) {

						triangles.splice( i, 1 );
						i --;
						l --;

					} else {

						tri.updateSide( plane, splittingTriangle, coplanarIndex );

					}

				} else {

					// we're splitting with a quad and a triangle
					const singleVert = arr.findIndex( v => {

						if ( positiveSide >= 2 ) {

							return plane.distanceToPoint( v ) < 0;

						} else {

							return plane.distanceToPoint( v ) > 0;

						}

					} );

					if ( singleVert === 0 ) {

						let tmp = _foundEdge.start;
						_foundEdge.start = _foundEdge.end;
						_foundEdge.end = tmp;

					} else if ( singleVert === - 1 ) {

						continue;

					}

					const nextVert1 = ( singleVert + 1 ) % 3;
					const nextVert2 = ( singleVert + 2 ) % 3;

					const nextTri1 = trianglePool.getTriangle();
					const nextTri2 = trianglePool.getTriangle();

					// choose the triangle that has the larger areas (shortest split distance)
					if ( arr[ nextVert1 ].distanceToSquared( _foundEdge.start ) < arr[ nextVert2 ].distanceToSquared( _foundEdge.end ) ) {

						nextTri1.a.copy( arr[ nextVert1 ] );
						nextTri1.b.copy( _foundEdge.start );
						nextTri1.c.copy( _foundEdge.end );

						nextTri2.a.copy( arr[ nextVert1 ] );
						nextTri2.b.copy( arr[ nextVert2 ] );
						nextTri2.c.copy( _foundEdge.start );

					} else {

						nextTri1.a.copy( arr[ nextVert2 ] );
						nextTri1.b.copy( _foundEdge.start );
						nextTri1.c.copy( _foundEdge.end );

						nextTri2.a.copy( arr[ nextVert1 ] );
						nextTri2.b.copy( arr[ nextVert2 ] );
						nextTri2.c.copy( _foundEdge.end );

					}

					tri.a.copy( arr[ singleVert ] );
					tri.b.copy( _foundEdge.end );
					tri.c.copy( _foundEdge.start );

					// don't add degenerate triangles to the list
					if ( ! isTriDegenerate( nextTri1 ) ) {

						triangles.push( nextTri1 );
						nextTri1.initFrom( tri );
						nextTri1.updateSide( plane, splittingTriangle, coplanarIndex );

					}

					if ( ! isTriDegenerate( nextTri2 ) ) {

						triangles.push( nextTri2 );
						nextTri2.initFrom( tri );
						nextTri2.updateSide( plane, splittingTriangle, coplanarIndex );

					}

					if ( isTriDegenerate( tri ) ) {

						triangles.splice( i, 1 );
						i --;
						l --;

					} else {

						tri.updateSide( plane, splittingTriangle, coplanarIndex );

					}

				}

			} else if ( intersects === 3 ) {

				console.warn( 'TriangleClipper: Coplanar clip not handled' );

			}

		}

	}

	reset() {

		this.triangles.length = 0;

	}

}

// Make a new array wrapper class that more easily affords expansion when reaching it's max capacity
class TypeBackedArray {

	constructor( type, initialSize = 500 ) {

		const bufferType = areSharedArrayBuffersSupported() ? SharedArrayBuffer : ArrayBuffer;

		this.expansionFactor = 1.5;
		this.type = type;
		this.array = new type( new bufferType( initialSize * type.BYTES_PER_ELEMENT ) );
		this.length = 0;

	}

	expand( size = null ) {

		const { type, array, expansionFactor } = this;

		if ( size === null ) {

			size = ~ ~ ( array.length * expansionFactor );

		}

		const newArray = new type( size );
		newArray.set( array, 0 );
		this.array = newArray;

	}

	push( ...args ) {

		let { array, length } = this;
		if ( length + args.length > array.length ) {

			this.expand();
			array = this.array;

		}

		for ( let i = 0, l = args.length; i < l; i ++ ) {

			array[ length + i ] = args[ i ];

		}

		this.length += args.length;

	}

	clear() {

		this.length = 0;

	}

}

// utility class for for tracking attribute data in type-backed arrays
class TypedAttributeData {

	constructor() {

		this.groupAttributes = [ {} ];
		this.groupCount = 0;

	}

	getType( name ) {

		return this.groupAttributes[ 0 ][ name ].type;

	}

	getTotalLength( name ) {

		const { groupCount, groupAttributes } = this;

		let length = 0;
		for ( let i = 0; i < groupCount; i ++ ) {

			const attrSet = groupAttributes[ i ];
			length += attrSet[ name ].length;

		}

		return length;

	}

	getGroupSet( index = 0 ) {

		// throw an error if we've never
		const { groupAttributes } = this;
		if ( groupAttributes[ index ] ) {

			this.groupCount = Math.max( this.groupCount, index + 1 );
			return groupAttributes[ index ];

		}

		// add any new group sets required
		const rootAttrSet = groupAttributes[ 0 ];
		this.groupCount = Math.max( this.groupCount, index + 1 );
		while ( index >= groupAttributes.length ) {

			const newAttrSet = {};
			groupAttributes.push( newAttrSet );
			for ( const key in rootAttrSet ) {

				newAttrSet[ key ] = new TypeBackedArray( rootAttrSet[ key ].type );

			}

		}

		return groupAttributes[ index ];

	}

	getGroupArray( name, index = 0 ) {

		// throw an error if we've never
		const { groupAttributes } = this;
		const rootAttrSet = groupAttributes[ 0 ];
		const referenceAttr = rootAttrSet[ name ];
		if ( ! referenceAttr ) {

			throw new Error( `TypedAttributeData: Attribute with "${ name }" has not been initialized` );

		}

		return this.getGroupSet( index )[ name ];

	}

	// initializes an attribute array with the given name, type, and size
	initializeArray( name, type ) {

		const { groupAttributes } = this;
		const rootSet = groupAttributes[ 0 ];
		const referenceAttr = rootSet[ name ];
		if ( referenceAttr ) {

			if ( referenceAttr.type !== type ) {

				throw new Error( `TypedAttributeData: Array ${ name } already initialized with a different type.` );

			}

		} else {

			for ( let i = 0, l = groupAttributes.length; i < l; i ++ ) {

				groupAttributes[ i ][ name ] = new TypeBackedArray( type );

			}

		}

	}

	clear() {

		this.groupCount = 0;

		const { groupAttributes } = this;
		groupAttributes.forEach( attrSet => {

			for ( const key in attrSet ) {

				attrSet[ key ].clear();

			}


		} );

	}

	delete( key ) {

		this.groupAttributes.forEach( attrSet => {

			delete attrSet[ key ];

		} );

	}

	reset() {

		this.groupAttributes = [];

	}

}

class TriangleIntersectData {

	constructor( tri ) {

		this.triangle = new Triangle().copy( tri );
		this.intersects = {};

	}

	addTriangle( index, tri ) {

		this.intersects[ index ] = new Triangle().copy( tri );

	}

	getIntersectArray() {

		const array = [];
		const { intersects } = this;
		for ( const key in intersects ) {

			array.push( intersects[ key ] );

		}

		return array;

	}

}

class TriangleIntersectionSets {

	constructor() {

		this.data = {};

	}

	addTriangleIntersection( ia, triA, ib, triB ) {

		const { data } = this;
		if ( ! data[ ia ] ) {

			data[ ia ] = new TriangleIntersectData( triA );

		}

		data[ ia ].addTriangle( ib, triB );

	}

	getTrianglesAsArray( id = null ) {

		const { data } = this;
		const arr = [];

		if ( id !== null ) {

			if ( id in data ) {

				arr.push( data[ id ].triangle );

			}

		} else {

			for ( const key in data ) {

				arr.push( data[ key ].triangle );

			}

		}

		return arr;

	}

	getTriangleIndices() {

		return Object.keys( this.data ).map( i => parseInt( i ) );

	}

	getIntersectionIndices( id ) {

		const { data } = this;
		if ( ! data[ id ] ) {

			return [];

		} else {

			return Object.keys( data[ id ].intersects ).map( i => parseInt( i ) );


		}

	}

	getIntersectionsAsArray( id = null, id2 = null ) {

		const { data } = this;
		const triSet = new Set();
		const arr = [];

		const addTriangles = key => {

			if ( ! data[ key ] ) return;

			if ( id2 !== null ) {

				if ( data[ key ].intersects[ id2 ] ) {

					arr.push( data[ key ].intersects[ id2 ] );

				}

			} else {

				const intersects = data[ key ].intersects;
				for ( const key2 in intersects ) {

					if ( ! triSet.has( key2 ) ) {

						triSet.add( key2 );
						arr.push( intersects[ key2 ] );

					}

				}

			}

		};

		if ( id !== null ) {

			addTriangles( id );

		} else {

			for ( const key in data ) {

				addTriangles( key );

			}

		}

		return arr;

	}

	reset() {

		this.data = {};

	}

}

class OperationDebugData {

	constructor() {

		this.enabled = false;
		this.triangleIntersectsA = new TriangleIntersectionSets();
		this.triangleIntersectsB = new TriangleIntersectionSets();
		this.intersectionEdges = [];

	}

	addIntersectingTriangles( ia, triA, ib, triB ) {

		const { triangleIntersectsA, triangleIntersectsB } = this;
		triangleIntersectsA.addTriangleIntersection( ia, triA, ib, triB );
		triangleIntersectsB.addTriangleIntersection( ib, triB, ia, triA );

	}

	addEdge( edge ) {

		this.intersectionEdges.push( edge.clone() );

	}

	reset() {

		this.triangleIntersectsA.reset();
		this.triangleIntersectsB.reset();
		this.intersectionEdges = [];

	}

}

const _matrix$1 = new Matrix4();
const _normalMatrix = new Matrix3();
const _triA = new Triangle();
const _triB = new Triangle();
const _tri = new Triangle();
const _barycoordTri = new Triangle();

function getFirstIdFromSet( set ) {

	for ( const id of set ) return id;

}

// runs the given operation against a and b using the splitter and appending data to the
// typedAttributeData object.
function performOperation( a, b, operation, splitter, typedAttributeData, options ) {

	const { useGroups = true } = options;
	const { aIntersections, bIntersections } = collectIntersectingTriangles( a, b );

	const resultGroups = [];
	let resultMaterials = null;

	let groupOffset;
	groupOffset = useGroups ? 0 : - 1;
	performWholeTriangleOperations( a, b, aIntersections, operation, false, typedAttributeData, groupOffset );
	performSplitTriangleOperations( a, b, aIntersections, operation, false, splitter, typedAttributeData, groupOffset );

	groupOffset = useGroups ? a.geometry.groups.length || 1 : - 1;
	performWholeTriangleOperations( b, a, bIntersections, operation, true, typedAttributeData, groupOffset );
	performSplitTriangleOperations( b, a, bIntersections, operation, true, splitter, typedAttributeData, groupOffset );

	return {
		groups: resultGroups,
		materials: resultMaterials
	};

}

// perform triangle splitting and CSG operations on the set of split triangles
function performSplitTriangleOperations( a, b, intersectionMap, operation, invert, splitter, attributeInfo, groupOffset = 0 ) {

	// transforms into the local frame of matrix b
	_matrix$1
		.copy( b.matrixWorld )
		.invert()
		.multiply( a.matrixWorld );

	_normalMatrix.getNormalMatrix( a.matrixWorld );

	const groupIndices = a.geometry.groupIndices;
	const aIndex = a.geometry.index;
	const aPosition = a.geometry.attributes.position;

	const bBVH = b.geometry.boundsTree;
	const bIndex = b.geometry.index;
	const bPosition = b.geometry.attributes.position;
	const splitIds = intersectionMap.ids;
	const intersectionSet = intersectionMap.intersectionSet;

	// iterate over all split triangle indices
	for ( let i = 0, l = splitIds.length; i < l; i ++ ) {

		const ia = splitIds[ i ];
		const groupIndex = groupOffset === - 1 ? 0 : groupIndices[ ia ] + groupOffset;
		const attrSet = attributeInfo.getGroupSet( groupIndex );

		// get the triangle in the geometry B local frame
		const ia3 = 3 * ia;
		const ia0 = aIndex.getX( ia3 + 0 );
		const ia1 = aIndex.getX( ia3 + 1 );
		const ia2 = aIndex.getX( ia3 + 2 );
		_triA.a.fromBufferAttribute( aPosition, ia0 ).applyMatrix4( _matrix$1 );
		_triA.b.fromBufferAttribute( aPosition, ia1 ).applyMatrix4( _matrix$1 );
		_triA.c.fromBufferAttribute( aPosition, ia2 ).applyMatrix4( _matrix$1 );

		// initialize the splitter with the triangle from geometry A
		splitter.initialize( _triA );

		// split the triangle with the intersecting triangles from B
		const intersectingIndices = intersectionSet[ ia ];
		for ( let ib = 0, l = intersectingIndices.length; ib < l; ib ++ ) {

			const ib3 = 3 * intersectingIndices[ ib ];
			const ib0 = bIndex.getX( ib3 + 0 );
			const ib1 = bIndex.getX( ib3 + 1 );
			const ib2 = bIndex.getX( ib3 + 2 );
			_triB.a.fromBufferAttribute( bPosition, ib0 );
			_triB.b.fromBufferAttribute( bPosition, ib1 );
			_triB.c.fromBufferAttribute( bPosition, ib2 );
			splitter.splitByTriangle( _triB );

		}

		// for all triangles in the split result
		const triangles = splitter.triangles;
		for ( let ib = 0, l = triangles.length; ib < l; ib ++ ) {

			// get the barycentric coordinates of the clipped triangle to add
			const clippedTri = triangles[ ib ];

			// try to use the side derived from the clipping but if it turns out to be
			// uncertain then fall back to the raycasting approach
			const hitSide = getHitSide( clippedTri, bBVH );
			// let hitSide = clippedTri.side;
			// if ( true || hitSide === null ) {

			// 	hitSide = getHitSide( clippedTri, bBVH );

			// }

			const action = getOperationAction( operation, hitSide, invert );
			if ( action !== SKIP_TRI ) {

				_triA.getBarycoord( clippedTri.a, _barycoordTri.a );
				_triA.getBarycoord( clippedTri.b, _barycoordTri.b );
				_triA.getBarycoord( clippedTri.c, _barycoordTri.c );
				switch ( action ) {

					case ADD_TRI:
						appendAttributeFromTriangle( ia, _barycoordTri, a.geometry, a.matrixWorld, _normalMatrix, attrSet );
						break;

					case INVERT_TRI:
						appendAttributeFromTriangle( ia, _barycoordTri, a.geometry, a.matrixWorld, _normalMatrix, attrSet, true );
						break;

				}

			}

		}

	}

	return splitIds.length;

}

// perform CSG operations on the set of whole triangles using a half edge structure
// at the moment this isn't always faster due to overhead of building the half edge structure
// and degraded connectivity due to split triangles.

function performWholeTriangleOperations( a, b, splitTriSet, operation, invert, attributeInfo, groupOffset = 0 ) {

	// matrix for transforming into the local frame of geometry b
	_matrix$1
		.copy( b.matrixWorld )
		.invert()
		.multiply( a.matrixWorld );

	_normalMatrix.getNormalMatrix( a.matrixWorld );

	const bBVH = b.geometry.boundsTree;
	const groupIndices = a.geometry.groupIndices;
	const aIndex = a.geometry.index;
	const aAttributes = a.geometry.attributes;
	const aPosition = aAttributes.position;

	const stack = [];
	const halfEdges = a.geometry.halfEdges;
	const traverseSet = new Set();
	for ( let i = 0, l = aIndex.count / 3; i < l; i ++ ) {

		if ( ! ( i in splitTriSet.intersectionSet ) ) {

			traverseSet.add( i );

		}

	}

	while ( traverseSet.size > 0 ) {

		const id = getFirstIdFromSet( traverseSet );
		traverseSet.delete( id );

		stack.push( id );

		// get the vertex indices
		const i3 = 3 * id;
		const i0 = aIndex.getX( i3 + 0 );
		const i1 = aIndex.getX( i3 + 1 );
		const i2 = aIndex.getX( i3 + 2 );

		// get the vertex position in the frame of geometry b so we can
		// perform hit testing
		_tri.a.fromBufferAttribute( aPosition, i0 ).applyMatrix4( _matrix$1 );
		_tri.b.fromBufferAttribute( aPosition, i1 ).applyMatrix4( _matrix$1 );
		_tri.c.fromBufferAttribute( aPosition, i2 ).applyMatrix4( _matrix$1 );

		// get the side and decide if we need to cull the triangle based on the operation
		const hitSide = getHitSide( _tri, bBVH );
		const action = getOperationAction( operation, hitSide, invert );
		while ( stack.length > 0 ) {

			const currId = stack.pop();
			const groupIndex = groupOffset === - 1 ? 0 : groupIndices[ currId ] + groupOffset;
			const attrSet = attributeInfo.getGroupSet( groupIndex );

			for ( let i = 0; i < 3; i ++ ) {

				const sid = halfEdges.getSiblingTriangleIndex( currId, i );
				if ( sid !== - 1 && traverseSet.has( sid ) ) {

					stack.push( sid );
					traverseSet.delete( sid );

				}

			}

			const i3 = 3 * currId;
			const i0 = aIndex.getX( i3 + 0 );
			const i1 = aIndex.getX( i3 + 1 );
			const i2 = aIndex.getX( i3 + 2 );

			switch ( action ) {

				case ADD_TRI:
					appendAttributesFromIndices( i0, i1, i2, aAttributes, a.matrixWorld, _normalMatrix, attrSet );
					break;

				case INVERT_TRI:
					appendAttributesFromIndices( i2, i1, i0, aAttributes, a.matrixWorld, _normalMatrix, attrSet, invert );
					break;

			}

		}

	}

}

// applies the given set of attribute data to the provided geometry. If the attributes are
// not large enough to hold the new set of data then new attributes will be created. Otherwise
// the existing attributes will be used and draw range updated to accommodate the new size.
function applyToGeometry( geometry, referenceGeometry, groups, attributeInfo ) {

	let needsDisposal = false;
	let drawRange = - 1;
	const groupCount = attributeInfo.groupCount;

	// set the data
	const attributes = geometry.attributes;
	const rootAttrSet = attributeInfo.groupAttributes[ 0 ];
	for ( const key in rootAttrSet ) {

		const requiredLength = attributeInfo.getTotalLength( key, groupCount );
		const type = rootAttrSet[ key ].type;
		let attr = attributes[ key ];
		if ( ! attr || attr.array.length < requiredLength ) {

			// create the attribute if it doesn't exist yet
			const refAttr = referenceGeometry.attributes[ key ];
			attr = new BufferAttribute( new type( requiredLength ), refAttr.itemSize, refAttr.normalized );
			geometry.setAttribute( key, attr );
			needsDisposal = true;

		}

		let offset = 0;
		for ( let i = 0; i < groupCount; i ++ ) {

			const { array, type, length } = attributeInfo.groupAttributes[ i ][ key ];
			const trimmedArray = new type( array.buffer, 0, length );
			attr.array.set( trimmedArray, offset );
			offset += trimmedArray.length;

		}

		attr.needsUpdate = true;
		drawRange = requiredLength / attr.itemSize;

	}

	// update the draw range
	geometry.setDrawRange( 0, drawRange );
	geometry.clearGroups();

	let groupOffset = 0;
	for ( let i = 0; i < groupCount; i ++ ) {

		const posCount = attributeInfo.getGroupArray( 'position', i ).length / 3;
		if ( posCount !== 0 ) {

			const group = groups[ i ];
			geometry.addGroup( groupOffset, posCount, group.materialIndex );
			groupOffset += posCount;

		}

	}

	// remove or update the index appropriately
	if ( geometry.index ) {

		const indexArray = geometry.index.array;
		if ( indexArray.length < drawRange ) {

			geometry.index = null;
			needsDisposal = true;

		} else {

			for ( let i = 0, l = indexArray.length; i < l; i ++ ) {

				indexArray[ i ] = i;

			}

		}

	}

	// remove the bounds tree if it exists because its now out of date
	// TODO: can we have this dispose in the same way that a brush does?
	geometry.boundsTree = null;

	if ( needsDisposal ) {

		geometry.dispose();

	}

	return geometry;

}

function getMaterialList( groups, materials ) {

	let result = materials;
	if ( ! Array.isArray( materials ) ) {

		result = [];
		groups.forEach( g => {

			result[ g.materialIndex ] = materials;

		} );

	}

	return result;

}

// Utility class for performing CSG operations
class Evaluator {

	constructor() {

		this.triangleSplitter = new TriangleSplitter();
		this.attributeData = new TypedAttributeData();
		this.attributes = [ 'position', 'uv', 'normal' ];
		this.useGroups = true;
		this.debug = new OperationDebugData();

	}

	evaluate( a, b, operation, targetBrush = new Brush() ) {

		a.prepareGeometry();
		b.prepareGeometry();

		const { triangleSplitter, attributeData, attributes, useGroups, debug } = this;
		const targetGeometry = targetBrush.geometry;
		const aAttributes = a.geometry.attributes;
		for ( let i = 0, l = attributes.length; i < l; i ++ ) {

			const key = attributes[ i ];
			const attr = aAttributes[ key ];
			attributeData.initializeArray( key, attr.array.constructor );

		}

		for ( const key in attributeData.attributes ) {

			if ( ! attributes.includes( key ) ) {

				attributeData.delete( key );

			}

		}

		for ( const key in targetGeometry.attributes ) {

			if ( ! attributes.includes( key ) ) {

				targetGeometry.deleteAttribute( key );
				targetGeometry.dispose();

			}

		}

		attributeData.clear();

		if ( debug.enabled ) {

			debug.reset();
			setDebugContext( debug );

		}

		performOperation( a, b, operation, triangleSplitter, attributeData, { useGroups } );

		if ( debug.enabled ) {

			setDebugContext( null );

		}

		// structure the groups appropriately
		const aGroups = ! useGroups || a.geometry.groups.length === 0 ?
			[ { start: 0, count: Infinity, materialIndex: 0 } ] :
			a.geometry.groups.map( group => ( { ...group } ) );

		const bGroups = ! useGroups || b.geometry.groups.length === 0 ?
			[ { start: 0, count: Infinity, materialIndex: 0 } ] :
			b.geometry.groups.map( group => ( { ...group } ) );

		// get the materials
		const aMaterials = getMaterialList( aGroups, a.material );
		const bMaterials = getMaterialList( bGroups, b.material );

		// adjust the material index
		bGroups.forEach( g => {

			g.materialIndex += aMaterials.length;

		} );

		// apply groups and attribute data to the geometry
		applyToGeometry( targetGeometry, a.geometry, [ ...aGroups, ...bGroups ], attributeData );

		// generate the minimum set of materials needed for the list of groups and adjust the groups
		// if they're needed
		const groups = targetGeometry.groups;
		if ( useGroups ) {

			const materialMap = new Map();
			const allMaterials = [ ...aMaterials, ...bMaterials ];

			// create a map from old to new index and remove materials that aren't used
			let newIndex = 0;
			for ( let i = 0, l = allMaterials.length; i < l; i ++ ) {

				const foundGroup = Boolean( groups.find( group => group.materialIndex === i ) );
				if ( ! foundGroup ) {

					allMaterials[ i ] = null;

				} else {

					materialMap.set( i, newIndex );
					newIndex ++;

				}

			}

			// adjust the groups indices
			for ( let i = 0, l = groups.length; i < l; i ++ ) {

				const group = groups[ i ];
				group.materialIndex = materialMap.get( group.materialIndex );

			}

			targetBrush.material = allMaterials.filter( material => material );

		}

		return targetBrush;

	}

	evaluateHierarchy( root, target = new Brush() ) {

		root.updateMatrixWorld( true );

		const flatTraverse = ( obj, cb ) => {

			const children = obj.children;
			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];
				if ( child.isOperationGroup ) {

					flatTraverse( child, cb );

				} else {

					cb( child );

				}

			}

		};


		const traverse = ( brush ) => {

			const children = brush.children;
			let didChange = false;
			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];
				didChange = traverse( child ) || didChange;

			}

			const isDirty = brush.isDirty();
			if ( isDirty ) {

				brush.markUpdated();

			}

			if ( didChange && ! brush.isOperationGroup ) {

				let result;
				flatTraverse( brush, child => {

					if ( ! result ) {

						result = this.evaluate( brush, child, child.operation );

					} else {

						result = this.evaluate( result, child, child.operation );

					}

				} );

				brush._cachedGeometry = result.geometry;
				brush._cachedMaterials = result.material;
				return true;

			} else {

				return didChange || isDirty;

			}

		};

		traverse( root );

		target.geometry = root._cachedGeometry;
		target.material = root._cachedMaterials;

		return target;

	}

	reset() {

		this.triangleSplitter.reset();

	}

}

class Operation extends Brush {

	constructor( ...args ) {

		super( ...args );

		this.isOperation = true;
		this.operation = ADDITION;

		this._cachedGeometry = new BufferGeometry();
		this._cachedMaterials = null;
		this._previousOperation = null;

	}

	markUpdated() {

		super.markUpdated();
		this._previousOperation = this.operation;

	}

	isDirty() {

		return this.operation !== this._previousOperation || super.isDirty();

	}

	insertBefore( brush ) {

		const parent = this.parent;
		const index = parent.children.indexOf( this );
		parent.children.splice( index, 0, brush );

		// TODO: throw event

	}

	insertAfter( brush ) {

		const parent = this.parent;
		const index = parent.children.indexOf( this );
		parent.children.splice( index + 1, 0, brush );

		// TODO: throw event

	}

}

class OperationGroup extends Group {

	constructor() {

		super();
		this.isOperationGroup = true;
		this._previousMatrix = new Matrix4();

	}

	markUpdated() {

		this._previousMatrix.copy( this.matrix );

	}

	isDirty() {

		const { matrix, _previousMatrix } = this;
		const el1 = matrix.elements;
		const el2 = _previousMatrix.elements;
		for ( let i = 0; i < 16; i ++ ) {

			if ( el1[ i ] !== el2[ i ] ) {

				return true;

			}

		}

		return false;

	}

}

function addWorldPosition( shader ) {

	if ( /varying\s+vec3\s+wPosition/.test( shader.vertexShader ) ) return;

	shader.vertexShader = `
			varying vec3 wPosition;
			${shader.vertexShader}
		`.replace(
		/#include <displacementmap_vertex>/,
		v =>
			`${v}
				wPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
				`,
	);

	shader.fragmentShader = `
		varying vec3 wPosition;
		${shader.fragmentShader}
		`;

	return shader;

}

function csgGridShaderMixin( shader ) {

	shader.uniforms = {
		...shader.uniforms,
		checkerboardColor: { value: new Color( 0x111111 ) }
	};

	addWorldPosition( shader );

	shader.defines = { CSG_GRID: 1 };

	shader.fragmentShader = shader.fragmentShader.replace(
		/#include <common>/,
		v =>
		/* glsl */`
			${v}

			uniform vec3 checkerboardColor;
			float getCheckerboard( vec2 p, float scale ) {

				p /= scale;
				p += vec2( 0.5 );

				vec2 line = mod( p, 2.0 ) - vec2( 1.0 );
				line = abs( line );

				vec2 pWidth = fwidth( line );
				vec2 value = smoothstep( 0.5 - pWidth / 2.0, 0.5 + pWidth / 2.0, line );
				float result = value.x * value.y + ( 1.0 - value.x ) * ( 1.0 - value.y );

				return result;

			}

			float getGrid( vec2 p, float scale, float thickness ) {

				p /= 0.5 * scale;

				vec2 stride = mod( p, 2.0 ) - vec2( 1.0 );
				stride = abs( stride );

				vec2 pWidth = fwidth( p );
				vec2 line = smoothstep( 1.0 - pWidth / 2.0, 1.0 + pWidth / 2.0, stride + thickness * pWidth );

				return max( line.x, line.y );

			}

			vec3 getFaceColor( vec2 p, vec3 color ) {

				float checkLarge = getCheckerboard( p, 1.0 );
				float checkSmall = abs( getCheckerboard( p, 0.1 ) );
				float lines = getGrid( p, 10.0, 1.0 );

				vec3 checkColor = mix(
					vec3( 0.7 ) * color,
					vec3( 1.0 ) * color,
					checkSmall * 0.4 + checkLarge * 0.6
				);

				vec3 gridColor = vec3( 1.0 );

				return mix( checkColor, gridColor, lines );

			}

			float angleBetween( vec3 a, vec3 b ) {

				return acos( abs( dot( a, b ) ) );

			}

			vec3 planeProject( vec3 norm, vec3 other ) {

				float d = dot( norm, other );
				return normalize( other - norm * d );

			}

			vec3 getBlendFactors( vec3 norm ) {

				vec3 xVec = vec3( 1.0, 0.0, 0.0 );
				vec3 yVec = vec3( 0.0, 1.0, 0.0 );
				vec3 zVec = vec3( 0.0, 0.0, 1.0 );

				vec3 projX = planeProject( xVec, norm );
				vec3 projY = planeProject( yVec, norm );
				vec3 projZ = planeProject( zVec, norm );

				float xAngle = max(
					angleBetween( xVec, projY ),
					angleBetween( xVec, projZ )
				);

				float yAngle = max(
					angleBetween( yVec, projX ),
					angleBetween( yVec, projZ )
				);

				float zAngle = max(
					angleBetween( zVec, projX ),
					angleBetween( zVec, projY )
				);

				return vec3( xAngle, yAngle, zAngle ) / ( 0.5 * PI );

			}
		` ).replace(
		/#include <normal_fragment_maps>/,
		v =>
		/* glsl */`${v}
				#if CSG_GRID
				{

					vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

					float yCont = abs( dot( vec3( 0.0, 1.0, 0.0 ), worldNormal ) );
					float zCont = abs( dot( vec3( 0.0, 0.0, 1.0 ), worldNormal ) );
					float xCont = abs( dot( vec3( 1.0, 0.0, 0.0 ), worldNormal ) );

					vec3 factors = getBlendFactors( worldNormal );
					factors = smoothstep( vec3( 0.475 ), vec3( 0.525 ), vec3( 1.0 ) - factors );

					float weight = factors.x + factors.y + factors.z;
					factors /= weight;

					vec3 color =
						getFaceColor( wPosition.yz, diffuseColor.rgb ) * factors.x +
						getFaceColor( wPosition.xz, diffuseColor.rgb ) * factors.y +
						getFaceColor( wPosition.xy, diffuseColor.rgb ) * factors.z;

					diffuseColor.rgb = color;

				}
				#endif
				`,
	);

	return shader;

}

class GridMaterial extends MeshPhongMaterial {

	get enableGrid() {

		return Boolean( this._enableGrid );

	}

	set enableGrid( v ) {

		if ( this._enableGrid !== v ) {

			this._enableGrid = v;
			this.needsUpdate = true;

		}

	}

	constructor( ...args ) {

		super( ...args );
		this.enableGrid = true;

	}

	onBeforeCompile( shader ) {

		csgGridShaderMixin( shader );
		shader.defines.CSG_GRID = Number( this.enableGrid );

	}

	customProgramCacheKey() {

		return this.enableGrid;

	}

}

function getTriangleDefinitions( ...triangles ) {

	function getVectorDefinition( v ) {

		return /* js */`new THREE.Vector3( ${ v.x }, ${ v.y }, ${ v.z } )`;

	}

	return triangles.map( t => {

		return /* js */`
			new THREE.Triangle(
				${ getVectorDefinition( t.a ) },
				${ getVectorDefinition( t.b ) },
				${ getVectorDefinition( t.c ) },
			)`.substring( 1 );

	} );

}

function logTriangleDefinitions( ...triangles ) {

	console.log( getTriangleDefinitions( ...triangles ).join( ',\n' ) );

}

function generateRandomTriangleColors( geometry ) {

	const position = geometry.attributes.position;
	const array = new Float32Array( position.count * 3 );

	const color = new Color();
	for ( let i = 0, l = array.length; i < l; i += 9 ) {

		color.setHSL(
			Math.random(),
			MathUtils.lerp( 0.5, 1.0, Math.random() ),
			MathUtils.lerp( 0.5, 0.75, Math.random() ),
		);

		array[ i + 0 ] = color.r;
		array[ i + 1 ] = color.g;
		array[ i + 2 ] = color.b;

		array[ i + 3 ] = color.r;
		array[ i + 4 ] = color.g;
		array[ i + 5 ] = color.b;

		array[ i + 6 ] = color.r;
		array[ i + 7 ] = color.g;
		array[ i + 8 ] = color.b;

	}

	geometry.setAttribute( 'color', new BufferAttribute( array, 3 ) );

}

class TriangleSetHelper extends Group {

	get color() {

		return this._mesh.material.color;

	}

	get side() {

		return this._mesh.material.side;

	}

	set side( v ) {

		this._mesh.material.side = v;

	}

	constructor( triangles = [] ) {

		super();

		const geometry = new BufferGeometry();
		const lineGeom = new BufferGeometry();
		this._mesh = new Mesh( geometry, new MeshPhongMaterial( {
			flatShading: true,
			transparent: true,
			opacity: 0.25,
		} ) );
		this._lines = new LineSegments( lineGeom, new LineBasicMaterial() );
		this._mesh.material.color = this._lines.material.color;

		this._lines.frustumCulled = false;
		this._mesh.frustumCulled = false;

		this.add( this._lines, this._mesh );

		this.setTriangles( triangles );

	}

	setTriangles( triangles ) {

		const triPositions = new Float32Array( 3 * 3 * triangles.length );
		const linePositions = new Float32Array( 6 * 3 * triangles.length );
		for ( let i = 0, l = triangles.length; i < l; i ++ ) {

			const i9 = 9 * i;
			const i18 = 18 * i;
			const tri = triangles[ i ];

			tri.a.toArray( triPositions, i9 + 0 );
			tri.b.toArray( triPositions, i9 + 3 );
			tri.c.toArray( triPositions, i9 + 6 );


			tri.a.toArray( linePositions, i18 + 0 );
			tri.b.toArray( linePositions, i18 + 3 );

			tri.b.toArray( linePositions, i18 + 6 );
			tri.c.toArray( linePositions, i18 + 9 );

			tri.c.toArray( linePositions, i18 + 12 );
			tri.a.toArray( linePositions, i18 + 15 );

		}

		this._mesh.geometry.dispose();
		this._mesh.geometry.setAttribute( 'position', new BufferAttribute( triPositions, 3 ) );

		this._lines.geometry.dispose();
		this._lines.geometry.setAttribute( 'position', new BufferAttribute( linePositions, 3 ) );

	}

}

class EdgesHelper extends LineSegments {

	get color() {

		return this.material.color;

	}

	constructor( edges = [] ) {

		super();
		this.frustumCulled = false;
		this.setEdges( edges );

	}

	setEdges( edges ) {

		const { geometry } = this;
		const points = edges.flatMap( e => [ e.start, e.end ] );
		geometry.dispose();
		geometry.setFromPoints( points );

	}

}

const _matrix = new Matrix4();
class PointsHelper extends InstancedMesh {

	get color() {

		return this.material.color;

	}

	constructor( count = 1000, points = [] ) {

		super( new SphereBufferGeometry( 0.025 ), new MeshBasicMaterial(), count );
		this.frustumCulled = false;
		this.setPoints( points );

	}

	setPoints( points ) {

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const point = points[ i ];
			_matrix.makeTranslation( point.x, point.y, point.z );
			this.setMatrixAt( i, _matrix );

		}

		this.count = points.length;

	}

}

const _tri1 = new Triangle();
const _tri2 = new Triangle();
const _center = new Vector3();
const _center2 = new Vector3();
const _edgeCenter = new Vector3();
const _edgeCenter2 = new Vector3();
const _projected = new Vector3();
const _projected2 = new Vector3();
const _projectedDir = new Vector3();
const _projectedDir2 = new Vector3();
const _edgeDir = new Vector3();
const _edgeDir2 = new Vector3();
const _vec = new Vector3();
const _vec2 = new Vector3();
const _finalPoint = new Vector3();
const _finalPoint2 = new Vector3();
const _plane = new Plane();
const _plane2 = new Plane();

function getTriangle( geometry, triIndex, target ) {

	const i3 = 3 * triIndex;
	let i0 = i3 + 0;
	let i1 = i3 + 1;
	let i2 = i3 + 2;

	const indexAttr = geometry.index;
	const posAttr = geometry.attributes.position;
	if ( indexAttr ) {

		i0 = indexAttr.getX( i0 );
		i1 = indexAttr.getX( i1 );
		i2 = indexAttr.getX( i2 );

	}

	target.a.fromBufferAttribute( posAttr, i0 );
	target.b.fromBufferAttribute( posAttr, i1 );
	target.c.fromBufferAttribute( posAttr, i2 );

	return target;

}

class HalfEdgeHelper extends EdgesHelper {

	constructor( geometry = null, halfEdges = null ) {

		super();

		if ( geometry && halfEdges ) {

			this.setHalfEdges( geometry, halfEdges );

		}

	}

	setHalfEdges( geometry, halfEdges ) {

		const indexAttr = geometry.index;
		const posAttr = geometry.attributes.position;

		const vertKeys = [ 'a', 'b', 'c' ];
		const edges = [];
		const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
		for ( let triIndex = 0; triIndex < triCount; triIndex ++ ) {

			getTriangle( geometry, triIndex, _tri1 );
			_tri1.getMidpoint( _center );
			_tri1.getPlane( _plane );
			for ( let e = 0; e < 3; e ++ ) {

				const otherTriIndex = halfEdges.getSiblingTriangleIndex( triIndex, e );
				const otherEdgeIndex = halfEdges.getSiblingEdgeIndex( triIndex, e );
				if ( otherTriIndex === - 1 ) {

					continue;

				}

				// get other triangle
				getTriangle( geometry, otherTriIndex, _tri2 );
				_tri2.getPlane( _plane2 );

				// get triangle center
				_tri2.getMidpoint( _center2 );

				// get edge centers
				{

					const nextE = ( e + 1 ) % 3;
					const v0 = _tri1[ vertKeys[ e ] ];
					const v1 = _tri1[ vertKeys[ nextE ] ];
					_edgeCenter.lerpVectors( v0, v1, 0.5 );

				}

				{

					const nextE = ( otherEdgeIndex + 1 ) % 3;
					const v0 = _tri2[ vertKeys[ otherEdgeIndex ] ];
					const v1 = _tri2[ vertKeys[ nextE ] ];
					_edgeCenter2.lerpVectors( v0, v1, 0.5 );

				}

				// get the projected centers
				_plane.projectPoint( _center2, _projected );
				_plane2.projectPoint( _center, _projected2 );

				// get the directions so we can flip them if needed
				_projectedDir.subVectors( _projected, _center );
				_projectedDir2.subVectors( _projected2, _center2 );

				// get the directions so we can flip them if needed
				_edgeDir.subVectors( _edgeCenter, _center );
				_edgeDir2.subVectors( _edgeCenter2, _center2 );

				if ( _projectedDir.dot( _edgeDir ) < 0 ) {

					_projectedDir.multiplyScalar( - 1 );

				}

				if ( _projectedDir2.dot( _edgeDir2 ) < 0 ) {

					_projectedDir2.multiplyScalar( - 1 );

				}

				// find the new points after inversion
				_vec.addVectors( _center, _projectedDir );
				_vec2.addVectors( _center2, _projectedDir2 );

				// project the points onto the triangle edge. This would be better
				// if we clipped instead of chose the closest point
				_tri1.closestPointToPoint( _vec, _finalPoint );
				_tri2.closestPointToPoint( _vec2, _finalPoint2 );

				const edge = new Line3();
				edge.start.copy( _center );
				edge.end.lerpVectors( _finalPoint, _finalPoint2, 0.5 );
				edges.push( edge );

			}

		}

		super.setEdges( edges );

	}

}

export { ADDITION, Brush, DIFFERENCE, EdgesHelper, Evaluator, GridMaterial, HalfEdgeHelper, HalfEdgeMap, INTERSECTION, Operation, OperationGroup, PointsHelper, SUBTRACTION, TriangleSetHelper, TriangleSplitter, generateRandomTriangleColors, getTriangleDefinitions, isTriDegenerate, logTriangleDefinitions };
//# sourceMappingURL=index.module.js.map
