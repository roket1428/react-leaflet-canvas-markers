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

export class CanvasIconLayer extends L.Layer {
    private _markers: { [key: string]: Marker } = {};
    private _context: CanvasRenderingContext2D | null = null;
    private _canvas: HTMLCanvasElement | null = null;
    private _map: L.Map;
    private _onClickListeners: Array<(event: any, marker: Marker) => void> = [];

    constructor(options?: CanvasIconLayerOptions) {
        super();
        L.setOptions(this, options);
    }

    // Add a marker to the canvas layer
    addMarker(marker: Marker) {
        L.Util.stamp(marker); // Ensure the marker has a unique ID
        this._markers[marker._leaflet_id] = marker;
    }

    // Remove a marker from the canvas layer
    removeMarker(marker: Marker) {
        delete this._markers[marker._leaflet_id];
    }

    // Handle layer addition to the map
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    onAdd(map: L.Map) {
        this._map = map;
        if (!this._canvas) {
            this._initCanvas();
        }
        this.getPane()?.appendChild(this._canvas!);

        map.on("moveend", this._reset, this);
        map.on("zoomstart", this._clearLayer, this);
        map.on("click", this._executeClickListeners, this);
        map.on("mousemove", this._onMouseMove, this);

        this._reset();
    }

    // Handle layer removal from the map
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    onRemove(map: L.Map) {
        this.getPane()?.removeChild(this._canvas!);
        map.off("moveend", this._reset, this);
        map.off("zoomstart", this._clearLayer, this);
        map.off("click", this._executeClickListeners, this);
        map.off("mousemove", this._onMouseMove, this);
    }

    // Clear the canvas content
    private _clearLayer = () => {
        this._context?.clearRect(0, 0, this._canvas?.width || 0, this._canvas?.height || 0);
    };

    // Reset the canvas size and redraw markers
    private _reset = () => {
        const size = this._map.getSize();
        this._canvas!.width = size.x;
        this._canvas!.height = size.y;
        this._redraw();
    };

    // Redraw all markers on the canvas
    private _redraw = () => {
        if (!this._map || !this._context) return;

        this._clearLayer();

        Object.keys(this._markers).forEach((key) => {
            const marker = this._markers[key];
            this._drawMarker(marker);
        });
    };

    // Draw individual marker on the canvas
    private _drawMarker = (marker: Marker) => {
        const pointPos = this._map.latLngToContainerPoint(marker.getLatLng());

        if (!marker.canvas_img) {
            marker.canvas_img = new Image();
            marker.canvas_img.src = marker.options.icon?.options.iconUrl || "";
            marker.canvas_img.onload = () => this._drawImage(marker, pointPos);
        } else {
            this._drawImage(marker, pointPos);
        }
    };

    // Draw marker image on the canvas
    private _drawImage = (marker: Marker, pointPos: L.Point) => {
        if (!this._context) return;

        const iconAnchor = marker.options.icon?.options.iconAnchor || [0, 0];
        const iconSize = marker.options.icon?.options.iconSize || [0, 0];

        this._context.drawImage(
            marker.canvas_img!,
            pointPos.x - iconAnchor[0],
            pointPos.y - iconAnchor[1],
            iconSize[0],
            iconSize[1]
        );
    };

    // Initialize the canvas element
    private _initCanvas() {
        this._canvas = L.DomUtil.create("canvas", "leaflet-canvas-icon-layer leaflet-layer");
        const size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._context = this._canvas.getContext("2d");

        L.DomUtil.addClass(this._canvas, "leaflet-zoom-" + (this._map.options.zoomAnimation ? "animated" : "hide"));
    }

    // Handle mouse move for hover events
    private _onMouseMove = (event: L.LeafletMouseEvent) => {
        L.DomUtil.removeClass(this._canvas!, "leaflet-interactive");

        for (const markerId in this._markers) {
            const marker = this._markers[markerId];
            const point = this._map.latLngToContainerPoint(marker.getLatLng());

            if (this._hitMarker(marker, point, event)) {
                L.DomUtil.addClass(this._canvas!, "leaflet-interactive");
                break;
            }
        }
    };

    // Check if the mouse is hovering over a marker
    private _hitMarker = (marker: Marker, point: L.Point, event: L.LeafletMouseEvent): boolean => {
        const { icon } = marker.options;
        const width = icon?.options.iconSize?.[0] || 0;
        const height = icon?.options.iconSize?.[1] || 0;

        const x = event.containerPoint.x;
        const y = event.containerPoint.y;

        return (
            x >= point.x - width / 2 &&
            x <= point.x + width / 2 &&
            y >= point.y - height / 2 &&
            y <= point.y + height / 2
        );
    };

    // Execute click listeners when a marker is clicked
    private _executeClickListeners = (event: L.LeafletMouseEvent) => {
        for (const markerId in this._markers) {
            const marker = this._markers[markerId];
            const point = this._map.latLngToContainerPoint(marker.getLatLng());

            if (this._hitMarker(marker, point, event)) {
                // Trigger marker click listeners
                this._onClickListeners.forEach((listener) => listener(event, marker));

                // Handle popup opening on marker click
                if (marker._popup) {
                    marker._popup.setLatLng(marker.getLatLng()).openOn(this._map);
                }
                break;
            }
        }
    };

    // Add custom click listener for markers
    addOnClickListener(listener: (event: L.LeafletMouseEvent, marker: Marker) => void) {
        this._onClickListeners.push(listener);
    }
}

export const canvasIconLayer = (options?: CanvasIconLayerOptions) => new CanvasIconLayer(options);
