import type { CustomLayerInterface, CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";

// clouds: equirectangular source sampled directly by a custom WebGL layer
// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-simple-custom-layer-on-a-globe
// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-custom-layer-with-tiles-to-a-globe
// https://svelte-maplibre-gl.mierune.dev/examples/custom-layer
export type GlobeCloudsOptions = {
	texture: string;
	period: number; // ms per rotation
	repaintInterval: number; // ms between repaints while animating
	getOpacity: () => number;
};

export type GlobeClouds = {
	load: () => void;
	add: () => void;
	start: () => void;
	stop: () => void;
	destroy: () => void;
};

// projectTile runs per vertex, so this sets both how closely the sheet follows the sphere and how accurately it is clipped at the horizon
const CLOUD_GRID = 64;
const CLOUD_VERTICES = CLOUD_GRID * CLOUD_GRID * 6;
const CLOUD_LAYER_ID = "clouds";

type CloudLayer = CustomLayerInterface & {
	program: WebGLProgram | null;
	variant: string;
	buffer: WebGLBuffer | null;
	texture: WebGLTexture | null;
};

function createCloudProgram(
	gl: WebGL2RenderingContext,
	shaderData: CustomRenderMethodInput["shaderData"]
): WebGLProgram {
	function compile(type: number, source: string): WebGLShader {
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}

	const program = gl.createProgram()!;

	gl.attachShader(program, compile(gl.VERTEX_SHADER,
		`#version 300 es
		${shaderData.vertexShaderPrelude}
		${shaderData.define}
		in vec2 a_pos;
		out vec2 v_mercator;
		void main() {
			v_mercator = a_pos;
			gl_Position = projectTile(a_pos);
		}`
	));

	// inverting mercator here rather than per vertex keeps the sample exact regardless of how coarse the mesh is relative to the screen;
	// the latitude expression is the slippy-map inverse: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Implementations
	gl.attachShader(program, compile(gl.FRAGMENT_SHADER,
		`#version 300 es
		precision highp float;
		uniform sampler2D u_cloud;
		uniform float u_rotation;
		uniform float u_opacity;
		in vec2 v_mercator;
		out vec4 fragColor;
		void main() {
			float latitude = atan(sinh(3.14159265 * (1.0 - 2.0 * v_mercator.y)));
			fragColor = vec4(1.0, 1.0, 1.0, u_opacity * texture(
				u_cloud, vec2(v_mercator.x + u_rotation, 0.5 - latitude / 3.14159265)
			).r);
		}`
	));

	gl.linkProgram(program);

	return program;
}

export function createGlobeClouds(map: MapLibreMap, options: GlobeCloudsOptions): GlobeClouds {
	let image: HTMLImageElement | null = null;
	let styleReady: boolean = false;
	let animating: boolean = false;
	let destroyed: boolean = false;
	let timer: ReturnType<typeof setInterval> | null = null;

	// the object-literal shape of every maplibre custom layer example; renderingMode is unset, so it is a "2d" layer with no depth
	// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-simple-custom-layer-on-a-globe
	// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-custom-style-layer
	// https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/
	const layer: CloudLayer = {
		id: CLOUD_LAYER_ID,
		type: "custom",

		program: null,
		variant: "",
		buffer: null,
		texture: null,

		onAdd(_map, context) {
			const gl = context as WebGL2RenderingContext;

			const vertices = new Float32Array(CLOUD_VERTICES * 2);
			let i = 0;

			for (let y = 0; y < CLOUD_GRID; y++) {
				for (let x = 0; x < CLOUD_GRID; x++) {
					const left = x / CLOUD_GRID;
					const right = (x + 1) / CLOUD_GRID;
					const top = y / CLOUD_GRID;
					const bottom = (y + 1) / CLOUD_GRID;

					vertices.set(
						[left, top, left, bottom, right, top,
						 right, top, left, bottom, right, bottom],
						i
					);
					i += 12;
				}
			}

			this.buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

			// the red channel alone is the density mask, a third of the texture memory of rgb; R8/RED is the WebGL2 sized format
			// from texImage2D's format table, reachable from the 6-argument HTMLImageElement overload
			// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
			// https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
			// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, image!);
			gl.generateMipmap(gl.TEXTURE_2D);

			// wrapping in x lets the rotation offset cross the antimeridian; the shader deliberately never wraps the coordinate itself,
			// which would break the derivative that mip selection depends on
			// https://bgolus.medium.com/rendering-a-sphere-on-a-quad-13c92025570c
			// https://community.khronos.org/t/texture-wrapping-in-shader-mipmapping/53799
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		},

		// the examples omit onRemove, as their layers live for the page; this one is removed on every setStyle
		// https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/#onremove
		onRemove(_map, context) {
			const gl = context as WebGL2RenderingContext;

			gl.deleteProgram(this.program);
			gl.deleteBuffer(this.buffer);
			gl.deleteTexture(this.texture);

			this.program = null;
			this.variant = "";
			this.buffer = null;
			this.texture = null;
		},

		// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-simple-custom-layer-on-a-globe
		render(context, args) {
			const gl = context as WebGL2RenderingContext;

			if (!this.texture) return;

			// the prelude differs per projection and changes across the globe to mercator transition, so the program is rebuilt on a flip
			// https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/CustomRenderMethodInput
			// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-custom-layer-with-tiles-to-a-globe
			if (this.variant !== args.shaderData.variantName) {
				gl.deleteProgram(this.program);
				this.program = createCloudProgram(gl, args.shaderData);
				this.variant = args.shaderData.variantName;
			}

			const program = this.program!;
			const at = (name: string) => gl.getUniformLocation(program, name);

			gl.useProgram(program);

			// the projection uniforms projectTile needs, in the example's order
			// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-simple-custom-layer-on-a-globe
			gl.uniformMatrix4fv(at("u_projection_matrix"), false, args.defaultProjectionData.mainMatrix);
			gl.uniformMatrix4fv(at("u_projection_fallback_matrix"), false, args.defaultProjectionData.fallbackMatrix);
			gl.uniform1f(at("u_projection_transition"), args.defaultProjectionData.projectionTransition);
			gl.uniform4f(at("u_projection_tile_mercator_coords"), ...args.defaultProjectionData.tileMercatorCoords);
			gl.uniform4f(at("u_projection_clipping_plane"), ...args.defaultProjectionData.clippingPlane);

			// rotating the texture coordinate stands in for spinning a cloud mesh
			// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html
			gl.uniform1f(at("u_rotation"), (performance.now() / options.period) % 1);
			gl.uniform1f(at("u_opacity"), options.getOpacity());

			// u_cloud keeps its default unit of 0, so binding TEXTURE0 is enough
			// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);

			const position = gl.getAttribLocation(program, "a_pos");
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

			gl.disable(gl.CULL_FACE);
			gl.enable(gl.BLEND);
			// alpha blends as maplibre's layers do, so the canvas stays opaque under the clouds
			// https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/#render
			gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			gl.drawArrays(gl.TRIANGLES, 0, CLOUD_VERTICES);
		}
	};

	// needs both the style and the texture; style.load re-adds the layer after setStyle, which drops custom layers
	// https://github.com/maplibre/maplibre-gl-js/issues/2587
	// https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#addlayer
	function add(): void {
		if (destroyed || !styleReady || !image || map.getLayer(CLOUD_LAYER_ID)) return;

		map.addLayer(layer);
	}

	function stop(): void {
		animating = false;

		if (timer !== null) {
			clearInterval(timer);
			timer = null;
		}
	}

	// an interval rather than the examples' triggerRepaint() at the end of render(), which would pin the map at full frame rate
	// https://maplibre.org/maplibre-gl-js/docs/examples/add-a-3d-model-using-threejs
	// https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#triggerrepaint
	function start(): void {
		animating = true;

		if (destroyed || !image || timer !== null) return;

		timer = setInterval(() => map.triggerRepaint(), options.repaintInterval);
	}

	return {
		// separate from add() so the caller can hold the texture back until the map has loaded; the layer waits for onload instead of a placeholder pixel
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
		load(): void {
			const loading = new Image();

			loading.onload = () => {
				if (destroyed) return;

				image = loading;
				add();

				if (animating) {
					start();
				}
			};
			loading.src = options.texture;
		},

		add(): void {
			styleReady = true;
			add();
		},

		start,
		stop,

		destroy(): void {
			stop();
			destroyed = true;
		}
	};
}