type Breakpoint = "desktop" | "tablet" | "mobile";

type BreakpointStrings = {
	[breakpoint in Breakpoint]?: string;
}

export type BreakpointNumbers = {
	[breakpoint in Breakpoint]?: number;
}

type FeedGridConfig = {
	columns?: number | null;
	style?: string | null;
	startRight: boolean;
}

type FeedGridImage = {
	key: string;
	index: number;
	classes: string;
	gridColumns: BreakpointStrings;
}

type FeedGridCell = {
	image?: FeedGridImage;
	itemIndex?: number;
}

type FeedGridLayout = {
	itemClasses: string[];
	itemGridColumns: BreakpointStrings[];
	cells: FeedGridCell[];
}

type BreakpointGridConfig = {
	uniformRow: string[];
	dynamicRows: string[][];
	dynamicRowsStartingRight?: string[][];
	stickyBesideWideSlots?: boolean;
}

type Placement = {
	itemIndex?: number;
	imageIndex?: number;
	gridColumn: string;
	rowIndex: number;
}

const breakpoints: Breakpoint[] = ["desktop", "tablet", "mobile"];

const mobileImageRow: string = "column-start 1 / column-end 2";

const breakpointGridConfigs: { [gridName: string]: BreakpointGridConfig } = {
	desktopFourColumns: {
		uniformRow: ["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"],
		dynamicRows: [
			["viewport-start / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"],
			["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"],
			["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / viewport-end"],
			["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"]
		],
		dynamicRowsStartingRight: [
			["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / viewport-end"],
			["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"],
			["viewport-start / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"],
			["eighth-start 1 / eighth-end 2", "eighth-start 3 / eighth-end 4", "eighth-start 5 / eighth-end 6", "eighth-start 7 / eighth-end 8"]
		]
	},
	desktopThreeColumns: {
		uniformRow: ["sixth-start 1 / sixth-end 2", "sixth-start 3 / sixth-end 4", "sixth-start 5 / sixth-end 6"],
		dynamicRows: [
			["viewport-start / sixth-end 4", "sixth-start 5 / sixth-end 6"],
			["sixth-start 1 / sixth-end 2", "sixth-start 3 / sixth-end 6"],
			["sixth-start 1 / sixth-end 2", "sixth-start 3 / sixth-end 4", "sixth-start 5 / sixth-end 6"],
			["sixth-start 1 / sixth-end 4", "sixth-start 5 / sixth-end 6"],
			["sixth-start 1 / sixth-end 2", "sixth-start 3 / viewport-end"],
			["sixth-start 1 / sixth-end 2", "sixth-start 3 / sixth-end 4", "sixth-start 5 / sixth-end 6"]
		],
		stickyBesideWideSlots: true
	},
	tablet: {
		uniformRow: ["third-start 1 / third-end 1", "third-start 2 / third-end 2", "third-start 3 / third-end 3"],
		dynamicRows: [
			["viewport-start / third-end 2", "third-start 3 / third-end 3"],
			["third-start 1 / third-end 1", "third-start 2 / third-end 2", "third-start 3 / third-end 3"],
			["third-start 1 / third-end 1", "third-start 2 / viewport-end"],
			["third-start 1 / third-end 1", "third-start 2 / third-end 2", "third-start 3 / third-end 3"]
		]
	},
	mobile: {
		uniformRow: ["column-start 1 / column-end 1", "column-start 2 / column-end 2"],
		dynamicRows: [
			["column-start 1 / column-end 1", "column-start 2 / column-end 2"],
			["column-start 1 / column-end 1", "column-start 2 / column-end 2"],
			["column-start 1 / column-end 1", "column-start 2 / column-end 2"],
			[mobileImageRow]
		]
	}
};

const breakpointGridConfig = (
	breakpoint: Breakpoint,
	columns?: number | null
): BreakpointGridConfig => {
	if (breakpoint !== "desktop") {
		return breakpointGridConfigs[breakpoint];
	}

	return columns === 4 ? breakpointGridConfigs.desktopFourColumns : breakpointGridConfigs.desktopThreeColumns;
};

const rowPattern = (
	grid: BreakpointGridConfig,
	config: FeedGridConfig
): string[][] => {
	if (config.style !== "dynamic") {
		return [grid.uniformRow];
	}

	if (config.startRight && grid.dynamicRowsStartingRight) {
		return grid.dynamicRowsStartingRight;
	}

	return grid.dynamicRows;
};

const fullBleedClass = (
	gridColumn: string,
	breakpoint: Breakpoint
): string | undefined => {
	if (gridColumn.startsWith("viewport-start")) {
		return `${breakpoint}-fullbleed-left`;
	}

	return gridColumn.endsWith("viewport-end") ? `${breakpoint}-fullbleed-right` : undefined;
};

const isSticky = (
	gridColumn: string,
	row: string[],
	grid: BreakpointGridConfig
): boolean => {
	if (!grid.stickyBesideWideSlots) {
		return false;
	}

	const besideWideSlot: boolean = row.some(otherGridColumn => !grid.uniformRow.includes(otherGridColumn));

	return besideWideSlot && grid.uniformRow.includes(gridColumn);
};

// inset wide slots keep items
const takesImage = (gridColumn: string): boolean => gridColumn === mobileImageRow || gridColumn.includes("viewport-");

const wholeRowColumn = (row: string[]): string => `${row[0].split(" / ")[0]} / ${row[row.length - 1].split(" / ")[1]}`;

const placeItemsAndImages = (
	rows: string[][],
	itemCount: number,
	imageCount: number,
	fillLastRow: boolean
): Placement[] => {
	const placements: Placement[] = [];
	let itemIndex: number = 0;
	let imageIndex: number = 0;

	for (let rowIndex: number = 0; itemIndex < itemCount; rowIndex++) {
		const row: string[] = rows[rowIndex % rows.length];

		for (const [slotIndex, gridColumn] of row.entries()) {
			const imagesCanFillRow: boolean = fillLastRow && imageCount > 0 && row.slice(slotIndex).every(takesImage);

			if (itemIndex === itemCount && !imagesCanFillRow) {
				break;
			}

			if (takesImage(gridColumn) && imageCount > 0) {
				placements.push({ imageIndex: imageIndex++, gridColumn, rowIndex });
			} else if (gridColumn !== mobileImageRow) {
				placements.push({ itemIndex: itemIndex++, gridColumn, rowIndex });
			}
		}
	}

	return placements;
};

const partialLastRow = (
	rows: string[][],
	placements: Placement[]
): Placement[] => {
	const lastPlacement: Placement | undefined = placements[placements.length - 1];

	if (!lastPlacement) {
		return [];
	}

	const lastRow: Placement[] = placements.filter(({ rowIndex }) => rowIndex === lastPlacement.rowIndex);

	return lastRow.length < rows[lastPlacement.rowIndex % rows.length].length ? lastRow : [];
};

const placementToImage = (
	placement: Placement,
	breakpoint: Breakpoint,
	imageCount: number,
	firstImageIndex: number
): FeedGridImage => ({
	key: `${placement.imageIndex}-${breakpoint}`,
	index: (firstImageIndex + (placement.imageIndex ?? 0)) % imageCount,
	classes: [
		fullBleedClass(placement.gridColumn, breakpoint),
		...breakpoints
			.filter(otherBreakpoint => otherBreakpoint !== breakpoint)
			.map(otherBreakpoint => `${otherBreakpoint}-hidden`)
	].filter(Boolean).join(" "),
	gridColumns: { [breakpoint]: placement.gridColumn }
});

export const feedGridLayout = (
	itemCount: number,
	imageCount: number,
	config: FeedGridConfig,
	hasMoreItems: boolean = false,
	firstImageIndexes: BreakpointNumbers = {}
): FeedGridLayout => {
	const layout: FeedGridLayout = {
		itemClasses: Array.from({ length: itemCount }, () => ""),
		itemGridColumns: Array.from({ length: itemCount }, () => ({})),
		cells: Array.from({ length: itemCount }, (_, itemIndex) => ({ itemIndex }))
	};
	const laidOut: boolean = config.columns === 3 || config.columns === 4;

	if (!laidOut) {
		return layout;
	}

	const imagesBefore: FeedGridImage[][] = Array.from({ length: itemCount }, () => []);
	const imagesAfter: FeedGridImage[] = [];

	for (const breakpoint of breakpoints) {
		const grid: BreakpointGridConfig = breakpointGridConfig(breakpoint, config.columns);
		const rows: string[][] = rowPattern(grid, config);
		const placements: Placement[] = placeItemsAndImages(rows, itemCount, imageCount, !hasMoreItems);
		const heldBack: Placement[] = hasMoreItems ? partialLastRow(rows, placements) : [];
		const lastRow: Placement[] = breakpoint !== "desktop" && !hasMoreItems ? partialLastRow(rows, placements) : [];
		const lastRowColumns: string[] = lastRow.length === 1 ? [wholeRowColumn(rows[lastRow[0].rowIndex % rows.length])] : ["half-start 1 / half-end 1", "half-start 2 / half-end 2"];
		let images: FeedGridImage[] = [];

		for (const placement of placements) {
			const isHeldBack: boolean = heldBack.includes(placement);

			if (placement.itemIndex === undefined) {
				if (!isHeldBack) {
					images.push(placementToImage(placement, breakpoint, imageCount, firstImageIndexes[breakpoint] ?? 0));
				}

				continue;
			}

			const itemIndex: number = placement.itemIndex;
			const row: string[] = rows[placement.rowIndex % rows.length];
			const gridColumn: string = lastRow.includes(placement) ? lastRowColumns[lastRow.indexOf(placement)] : placement.gridColumn;

			layout.itemGridColumns[itemIndex][breakpoint] = gridColumn;
			layout.itemClasses[itemIndex] = [
				layout.itemClasses[itemIndex],
				fullBleedClass(gridColumn, breakpoint),
				isSticky(gridColumn, row, grid) ? `${breakpoint}-sticky` : undefined,
				isHeldBack ? `${breakpoint}-hidden` : undefined
			].filter(Boolean).join(" ");
			imagesBefore[itemIndex].push(...images);
			images = [];
		}

		imagesAfter.push(...images);
	}

	layout.cells = [
		...imagesBefore.flatMap((images, itemIndex) => [...images.map(image => ({ image })), { itemIndex }]),
		...imagesAfter.map(image => ({ image }))
	];

	return layout;
};

export const feedGridItemsPerLoad = (
	loadedItemCount: number,
	rowsPerLoad: number,
	imageCount: number,
	config: FeedGridConfig,
	hasMoreItems: boolean
): number => {
	const rows: string[][] = rowPattern(breakpointGridConfig("desktop", config.columns), config);
	const shownRowCount = (itemCount: number): number => {
		const placements: Placement[] = placeItemsAndImages(rows, itemCount, imageCount, !hasMoreItems);
		const rowCount: number = (placements[placements.length - 1]?.rowIndex ?? -1) + 1;

		return hasMoreItems && partialLastRow(rows, placements).length > 0 ? rowCount - 1 : rowCount;
	};
	const targetRowCount: number = shownRowCount(loadedItemCount) + rowsPerLoad;
	let itemCount: number = loadedItemCount;

	// hold-back hides a partial row; a whole page would show it
	while (hasMoreItems ? shownRowCount(itemCount) < targetRowCount : shownRowCount(itemCount + 1) <= targetRowCount) {
		itemCount++;
	}

	return itemCount - loadedItemCount;
};

export const feedGridFirstImageIndexes = (
	pageItemCounts: number[],
	imageCount: number,
	pageConfigs: FeedGridConfig[]
): BreakpointNumbers[] => {
	const nextImageIndexes: BreakpointNumbers = {};

	return pageItemCounts.map((itemCount, pageIndex) => {
		const firstImageIndexes: BreakpointNumbers = { ...nextImageIndexes };
		const config: FeedGridConfig = pageConfigs[pageIndex];

		for (const breakpoint of breakpoints) {
			const rows: string[][] = rowPattern(breakpointGridConfig(breakpoint, config.columns), config);
			const imagesShown: number = placeItemsAndImages(rows, itemCount, imageCount, true)
				.filter(({ imageIndex }) => imageIndex !== undefined).length;

			nextImageIndexes[breakpoint] = (nextImageIndexes[breakpoint] ?? 0) + imagesShown;
		}

		return firstImageIndexes;
	});
};