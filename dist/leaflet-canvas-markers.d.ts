import L from "leaflet";
interface CanvasIconLayerOptions {
    pane?: string;
    icon?: L.Icon;
}
interface Marker extends L.Marker {
    canvas_img?: HTMLImageElement;
    _leaflet_id: number;
    _popup: L.Popup;
}
export declare class CanvasIconLayer extends L.Layer {
    private _markers;
    private _context;
    private _canvas;
    private _map;
    private _onClickListeners;
    constructor(options?: CanvasIconLayerOptions);
    addMarker(marker: Marker): void;
    removeMarker(marker: Marker): void;
    onAdd(map: L.Map): void;
    onRemove(map: L.Map): void;
    private _clearLayer;
    private _reset;
    private _redraw;
    private _drawMarker;
    private _drawImage;
    private _initCanvas;
    private _onMouseMove;
    private _hitMarker;
    private _executeClickListeners;
    addOnClickListener(listener: (event: L.LeafletMouseEvent, marker: Marker) => void): void;
}
export declare const canvasIconLayer: (options?: CanvasIconLayerOptions) => CanvasIconLayer;
export {};
