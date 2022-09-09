vec3 r = normalize(reflect(rayDir, n));
// http://www.pocketgl.com/reflections/
vec2 uv = vec2( atan( -r.z, -r.x ) * RECIPROCAL_PI2 + 0.5, r.y * 0.5 + 0.5 );
float fresnel = pow(1.-dot(normalize(cameraPosition), n), __envMapFresnelPower__);
float fresnelFactor = (1.-__envMapFresnel__) + __envMapFresnel__*fresnel;
vec3 env = texture2D(__envMap__, uv).rgb * __envMapTint__ * __envMapIntensity__ * fresnelFactor;
col += env