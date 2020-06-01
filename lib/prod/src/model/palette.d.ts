export declare class Palette {
    private _maxUsedIndex;
    private readonly _colorToIndex;
    private readonly _indexToColor;
    colorByIndex(index: number): string;
    addColor(color: string): number;
    clear(): void;
    size(): number;
}
