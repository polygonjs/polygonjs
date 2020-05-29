import {AssemblerName, ControllerAssemblerPair} from './_BaseRegister';
import {GlAssemblerController} from '../../../nodes/gl/code/Controller';
import {ShaderAssemblerBasic} from '../../../nodes/gl/code/assemblers/materials/Basic';
import {ShaderAssemblerLambert} from '../../../nodes/gl/code/assemblers/materials/Lambert';
import {ShaderAssemblerStandard} from '../../../nodes/gl/code/assemblers/materials/Standard';
import {ShaderAssemblerPoints} from '../../../nodes/gl/code/assemblers/materials/Points';
import {ShaderAssemblerParticles} from '../../../nodes/gl/code/assemblers/particles/Particles';
import {ShaderAssemblerTexture} from '../../../nodes/gl/code/assemblers/textures/Texture';
import {ShaderAssemblerVolume} from '../../../nodes/gl/code/assemblers/materials/Volume';

export interface AssemblersMap extends Dictionary<ControllerAssemblerPair> {
	[AssemblerName.GL_MESH_BASIC]: {
		controller: GlAssemblerController<ShaderAssemblerBasic>;
		assembler: typeof ShaderAssemblerBasic;
	};
	[AssemblerName.GL_MESH_LAMBERT]: {
		controller: GlAssemblerController<ShaderAssemblerLambert>;
		assembler: typeof ShaderAssemblerLambert;
	};
	[AssemblerName.GL_MESH_STANDARD]: {
		controller: GlAssemblerController<ShaderAssemblerStandard>;
		assembler: typeof ShaderAssemblerStandard;
	};
	[AssemblerName.GL_PARTICLES]: {
		controller: GlAssemblerController<ShaderAssemblerParticles>;
		assembler: typeof ShaderAssemblerParticles;
	};
	[AssemblerName.GL_POINTS]: {
		controller: GlAssemblerController<ShaderAssemblerPoints>;
		assembler: typeof ShaderAssemblerPoints;
	};
	[AssemblerName.GL_TEXTURE]: {
		controller: GlAssemblerController<ShaderAssemblerTexture>;
		assembler: typeof ShaderAssemblerTexture;
	};
	[AssemblerName.GL_VOLUME]: {
		controller: GlAssemblerController<ShaderAssemblerVolume>;
		assembler: typeof ShaderAssemblerVolume;
	};
}

import {Poly} from '../../../Poly';
export class AllAssemblersRegister {
	static run(poly: Poly) {
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_MESH_BASIC,
			GlAssemblerController,
			ShaderAssemblerBasic
		);
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_MESH_LAMBERT,
			GlAssemblerController,
			ShaderAssemblerLambert
		);
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_MESH_STANDARD,
			GlAssemblerController,
			ShaderAssemblerStandard
		);
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_PARTICLES,
			GlAssemblerController,
			ShaderAssemblerParticles
		);
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_POINTS,
			GlAssemblerController,
			ShaderAssemblerPoints
		);
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_TEXTURE,
			GlAssemblerController,
			ShaderAssemblerTexture
		);
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_VOLUME,
			GlAssemblerController,
			ShaderAssemblerVolume
		);
	}
}
