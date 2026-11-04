import type { CustomLayerInterface, Map as MapLibreMap } from "maplibre-gl";

// glow: a rim of color around the globe, drawn over the whole canvas by a custom WebGL layer;
// maplibre's own atmosphere (the sky's atmosphere-blend) is a scattering model whose colors are fixed blue-white
// https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/CustomRenderMethodInput
export type GlobeGlowOptions = {
	color?: string; // #rrggbb; without one, nothing is drawn
	opacity: number; // at the limb
	width: number; // how far past the limb the glow falls to 1/e, in globe radii
	inner: number; // how quickly it fades inward from the limb; higher is a thinner inner rim
	overflow?: HTMLElement; // as wide as the map, with its bottom edge on the map's top edge: there the glow carries on past the canvas, which WebGL can't draw beyond
};

export type GlobeGlow = {
	add: () => void;
	setColor: (color?: string) => void;
};

const GLOW_LAYER_ID = "glow";

type GlowLayer = CustomLayerInterface & {
	program: WebGLProgram | null;
	buffer: WebGLBuffer | null;
};

function createGlowProgram(gl: WebGL2RenderingContext): WebGLProgram {
	function compile(type: number, source: string): WebGLShader {
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}

	const program = gl.createProgram()!;

	gl.attachShader(program, compile(gl.VERTEX_SHADER,
		`#version 300 es
		in vec2 a_pos;
		out vec2 v_clip;
		void main() {
			v_clip = a_pos;
			gl_Position = vec4(a_pos, 0.0, 1.0);
		}`
	));

	// each pixel's view ray, taken back through the projection into the space where the planet is a unit sphere at the origin;
	// how close the ray passes to the center, in planet radii, places the pixel against the limb (below 1 it hits the globe)
	gl.attachShader(program, compile(gl.FRAGMENT_SHADER,
		`#version 300 es
		precision highp float;
		uniform mat4 u_inverse;
		uniform vec3 u_color;
		uniform float u_opacity;
		uniform float u_width;
		uniform float u_inner;
		in vec2 v_clip;
		out vec4 fragColor;
		void main() {
			vec4 near = u_inverse * vec4(v_clip, -1.0, 1.0);
			vec4 far = u_inverse * vec4(v_clip, 1.0, 1.0);
			vec3 origin = near.xyz / near.w;
			vec3 direction = normalize(far.xyz / far.w - origin);
			float closest = length(origin - direction * dot(origin, direction));
			float glow = closest < 1.0 ? pow(closest, u_inner) : exp((1.0 - closest) / u_width);
			fragColor = vec4(u_color, 1.0) * glow * u_opacity;
		}`
	));

	gl.linkProgram(program);

	return program;
}

export function createGlobeGlow(map: MapLibreMap, options: GlobeGlowOptions): GlobeGlow {
	const toRgb = (hex?: string) => hex ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) : null;
	let color = toRgb(options.color);
	let overflowState = "";

	// the shader's closest approach, in double precision: how near the view ray through a clip-space point passes to the planet's center, in planet radii
	function closest(inverse: DOMMatrix, x: number, y: number): number {
		const near = inverse.transformPoint(new DOMPoint(x, y, -1, 1));
		const far = inverse.transformPoint(new DOMPoint(x, y, 1, 1));
		const origin = [near.x / near.w, near.y / near.w, near.z / near.w];
		const ray = [far.x / far.w - origin[0], far.y / far.w - origin[1], far.z / far.w - origin[2]];
		const along = -(origin[0] * ray[0] + origin[1] * ray[1] + origin[2] * ray[2]) / (ray[0] * ray[0] + ray[1] * ray[1] + ray[2] * ray[2]);
		return Math.hypot(origin[0] + ray[0] * along, origin[1] + ray[1] * along, origin[2] + ray[2] * along);
	}

	// above the canvas the glow goes on as a radial gradient: it is round about the globe's center on screen, so its profile
	// along one line up from the center gives every stop
	function paintOverflow(matrix: ArrayLike<number>, main: DOMMatrix, inverse: DOMMatrix, opacity: number): void {
		const element = options.overflow;
		if (!element) return;

		const { clientWidth: width, clientHeight: height } = map.getContainer();
		const state = `${Array.from(matrix)} ${width} ${height} ${element.clientHeight} ${color} ${opacity}`;
		if (state === overflowState) return;
		overflowState = state;

		if (!color || opacity <= 0) {
			element.style.backgroundImage = "";
			return;
		}

		const center = main.transformPoint(new DOMPoint(0, 0, 0, 1));
		const x = ((center.x / center.w + 1) / 2) * width;
		const y = ((1 - center.y / center.w) / 2) * height;
		const at = (distance: number) => closest(inverse, (2 * x) / width - 1, 1 - (2 * (y - distance)) / height);

		// the distance up from the center at which the ray passes a given number of radii from the planet
		const reach = (radii: number) => {
			let low = 0;
			let high = 4 * height;
			for (let i = 0; i < 40; i++) {
				const middle = (low + high) / 2;
				if (at(middle) < radii) low = middle;
				else high = middle;
			}
			return high;
		};

		const limb = reach(1);
		// while the canvas cuts off the top of the globe, the strip would ring a cap that isn't drawn,
		// so it comes in as the globe clears the edge, over the distance in which the glow falls to 1/e
		const strength = opacity * Math.min(1, Math.max(0, (y - limb) / (reach(1 + options.width) - limb)));

		if (!(strength > 1 / 512)) {
			element.style.backgroundImage = "";
			return;
		}

		const end = reach(1 + options.width * Math.log(512 * strength)); // where the glow is below half a level of 255
		const [r, g, b] = color.map((channel) => Math.round(channel * 255));
		const stops = [`rgba(${r}, ${g}, ${b}, 0) ${limb}px`];

		for (let i = 0; i <= 32; i++) {
			const distance = limb + ((end - limb) * i) / 32;
			stops.push(`rgba(${r}, ${g}, ${b}, ${(strength * Math.exp((1 - at(distance)) / options.width)).toFixed(4)}) ${distance}px`);
		}

		element.style.backgroundImage = `radial-gradient(circle at ${x}px ${y + element.clientHeight}px, ${stops.join(", ")})`;
	}

	const layer: GlowLayer = {
		id: GLOW_LAYER_ID,
		type: "custom",

		program: null,
		buffer: null,

		onAdd(_map, context) {
			const gl = context as WebGL2RenderingContext;

			this.program = createGlowProgram(gl);

			// one triangle that covers the whole viewport
			this.buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		},

		onRemove(_map, context) {
			const gl = context as WebGL2RenderingContext;

			gl.deleteProgram(this.program);
			gl.deleteBuffer(this.buffer);

			this.program = null;
			this.buffer = null;
		},

		render(context, args) {
			const gl = context as WebGL2RenderingContext;
			const projection = args.defaultProjectionData;

			// the rim belongs to the globe, so it goes as the projection turns to mercator at high zoom
			const opacity = options.opacity * projection.projectionTransition;
			// inverted here, in double precision, rather than in the shader
			const main = new DOMMatrix(Array.from(projection.mainMatrix));
			const inverse = main.inverse();

			paintOverflow(projection.mainMatrix, main, inverse, opacity);
			if (!this.program || !color || opacity <= 0) return;

			const program = this.program;
			const at = (name: string) => gl.getUniformLocation(program, name);

			gl.useProgram(program);

			gl.uniformMatrix4fv(at("u_inverse"), false, inverse.toFloat32Array());
			gl.uniform3f(at("u_color"), color[0], color[1], color[2]);
			gl.uniform1f(at("u_opacity"), opacity);
			gl.uniform1f(at("u_width"), options.width);
			gl.uniform1f(at("u_inner"), options.inner);

			const position = gl.getAttribLocation(program, "a_pos");
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.CULL_FACE);
			gl.enable(gl.BLEND);
			// the shader's color is premultiplied: over the globe the canvas stays opaque, past the glow the page shows through
			gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}
	};

	// kept above every other layer, the clouds included, which arrive only once their texture has loaded
	map.on("styledata", () => {
		const order = map.getLayersOrder();

		if (order.includes(GLOW_LAYER_ID) && order[order.length - 1] !== GLOW_LAYER_ID) {
			map.moveLayer(GLOW_LAYER_ID);
		}
	});

	return {
		// style.load re-adds it after setStyle
		add(): void {
			if (map.getLayer(GLOW_LAYER_ID)) return;

			map.addLayer(layer);
		},

		setColor(value?: string): void {
			color = toRgb(value);
			map.triggerRepaint();
		}
	};
}