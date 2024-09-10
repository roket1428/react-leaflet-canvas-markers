import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { canvasIconLayer } from './leaflet-canvas-markers'; // Ensure you import the canvasIconLayer extension
import isEqual from 'lodash';
const CanvasMarkersLayer = ({ children = null, options = {}, onMarkerClick = () => { }, dataKey = 'position', }) => {
    const map = useMap();
    const layerRef = useRef(null);
    const prevChildrenRef = useRef(null);
    // Create the Leaflet layer
    useEffect(() => {
        const layer = canvasIconLayer(options || {});
        layerRef.current = layer;
        map.addLayer(layer);
        // Initialize event listeners
        initEventListeners(layer);
        return () => {
            map.removeLayer(layer);
        };
    }, [map, options]);
    // Compare props and redraw if necessary
    useEffect(() => {
        if (!checkPropsEqual(prevChildrenRef.current, children)) {
            layerRef.current?.redraw();
        }
        prevChildrenRef.current = children;
    }, [children]);
    const initEventListeners = (layer) => {
        layer.addOnClickListener((event, marker) => {
            onMarkerClick(event, marker);
            if (marker._popup) {
                marker._popup.setLatLng(marker.getLatLng()).openOn(layer._map);
            }
        });
    };
    const checkPropsEqual = (from, to) => {
        if (!from && !to) {
            return true;
        }
        if (Array.isArray(from) && Array.isArray(to)) {
            if (from.length !== to.length) {
                return false;
            }
            return from.every((item, index) => isEqual(item.props?.[dataKey], to[index].props?.[dataKey]));
        }
        if (typeof from === 'object' && typeof to === 'object') {
            return isEqual(from?.props?.[dataKey], to?.props?.[dataKey]);
        }
        return false;
    };
    return null;
};
export default CanvasMarkersLayer;
