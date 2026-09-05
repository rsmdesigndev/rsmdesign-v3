const imageHost: string = "https://images.rsmdesign.com";

export type ImageTransform = {
	width?: number;
	height?: number;
	quality?: number;
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
	format?: "auto" | "avif" | "webp" | "jpeg" | "png";
	sharpen?: number;
};

const transformOptions = (transform: ImageTransform): string =>
	Object.entries({ format: "auto", quality: 81, fit: "scale-down", sharpen: 1, ...transform })
		.filter(([, value]) => value !== undefined && value !== null)
		.map(([option, value]) => `${option}=${value}`)
		.join(",");

// For images
export function assetUrl(id: string | null | undefined) {
	return `${imageHost}/${id}`;
}
/* Optimization step
export function assetUrl(
	id: string | null | undefined,
	transform: ImageTransform = {}
) {
	return `${imageHost}/cdn-cgi/image/${transformOptions(transform)}/${id}`;
}
*/

// Video, documents, downloads: anything Cloudflare cannot transform
export function rawAssetUrl(id: string | null | undefined) {
	return `${imageHost}/${id}`;
}
