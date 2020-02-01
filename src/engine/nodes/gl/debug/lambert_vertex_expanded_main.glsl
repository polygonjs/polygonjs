void main() {

#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )

	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

#endif


#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )

	vUv2 = uv2;

#endif


#ifdef USE_COLOR

	vColor.xyz = color.xyz;

#endif


vec3 objectNormal = vec3( normal );


#ifdef USE_MORPHNORMALS

	objectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
	objectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
	objectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
	objectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];

#endif


#ifdef USE_SKINNING

	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );

#endif


#ifdef USE_SKINNING

	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;

	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;

#endif


vec3 transformedNormal = normalMatrix * objectNormal;

#ifdef FLIP_SIDED

	transformedNormal = - transformedNormal;

#endif


vec3 transformed = vec3( position );


#ifdef USE_MORPHTARGETS

	transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
	transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
	transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
	transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];

	#ifndef USE_MORPHNORMALS

	transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
	transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
	transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
	transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];

	#endif

#endif


#ifdef USE_SKINNING

	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );

	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;

	transformed = ( bindMatrixInverse * skinned ).xyz;

#endif


vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

gl_Position = projectionMatrix * mvPosition;


#ifdef USE_LOGDEPTHBUF

	#ifdef USE_LOGDEPTHBUF_EXT

		vFragDepth = 1.0 + gl_Position.w;

	#else

		gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;

		gl_Position.z *= gl_Position.w;

	#endif

#endif


#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG ) && ! defined( MATCAP )
	vViewPosition = - mvPosition.xyz;
#endif


#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )

	vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

#endif


#ifdef USE_ENVMAP

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )

		vWorldPosition = worldPosition.xyz;

	#else

		vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );

		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vReflect = reflect( cameraToVertex, worldNormal );

		#else

			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );

		#endif

	#endif

#endif


vec3 diffuse = vec3( 1.0 );

GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = normalize( -mvPosition.xyz );

GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;

vLightFront = vec3( 0.0 );
vIndirectFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
	vIndirectBack = vec3( 0.0 );
#endif

IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;

#if NUM_POINT_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		getPointDirectLightIrradiance( pointLights[ i ], geometry, directLight );

		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif

	}

#endif

#if NUM_SPOT_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );

		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif
	}

#endif

/*
#if NUM_RECT_AREA_LIGHTS > 0

	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		// TODO (abelnation): implement

	}

#endif
*/

#if NUM_DIR_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );

		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;

		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

		#ifdef DOUBLE_SIDED

			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

		#endif

	}

#endif

#if NUM_HEMI_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

		vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

		#ifdef DOUBLE_SIDED

			vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );

		#endif

	}

#endif


#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * worldPosition;

	}

	#endif

	#if NUM_SPOT_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		vSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * worldPosition;

	}

	#endif

	#if NUM_POINT_LIGHTS > 0

	#pragma unroll_loop
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * worldPosition;

	}

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): update vAreaShadowCoord with area light info

	#endif
	*/

#endif


#ifdef USE_FOG

	fogDepth = -mvPosition.z;

#endif

	
	
	
	// /MAT/shader_builder_noise/globals1
	v_POLYGON_globals1_position = position;
	v_POLYGON_globals1_normal = normal;
	
	// /MAT/shader_builder_noise/output1
	mvPosition = modelViewMatrix * vec4( v_POLYGON_globals1_normal, 1.0 );
	vViewPosition = -mvPosition.xyz;
	gl_Position = projectionMatrix * mvPosition;
}