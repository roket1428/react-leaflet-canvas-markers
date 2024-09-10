interface CanvasMarkersLayerProps {
    children?: React.ReactNode;
    options?: any;
    onMarkerClick?: (event: any, marker: any) => void;
    dataKey?: string;
}
declare const CanvasMarkersLayer: React.FC<CanvasMarkersLayerProps>;
export default CanvasMarkersLayer;
