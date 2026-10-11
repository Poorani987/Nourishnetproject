import React, { useState, useEffect } from 'react';
import { routesApi } from '../api/client';
import { RoadNode, RoadEdge, RouteResponse } from '../types';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Truck
} from 'lucide-react';

export const RouteMapPage: React.FC = () => {
  const [nodes, setNodes] = useState<RoadNode[]>([]);
  const [edges, setEdges] = useState<RoadEdge[]>([]);
  const [sourceNodeId, setSourceNodeId] = useState<number>(1); // Erode Junction
  const [targetNodeId, setTargetNodeId] = useState<number>(7); // Perundurai Town
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      const [n, e] = await Promise.all([
        routesApi.getNodes(),
        routesApi.getEdges(),
      ]);
      setNodes(n);
      setEdges(e);
      // Auto-calculate initial demo route
      if (n.length > 0) {
        handleCalculate(1, 7);
      }
    } catch {
      // Handle when backend is offline
    }
  };

  const handleCalculate = async (sourceId = sourceNodeId, targetId = targetNodeId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await routesApi.calculateRoute(sourceId, targetId);
      setRouteResult(res);
      if (!res.reachable) {
        setError(`Destination is unreachable from ${res.sourceName}. No connected road segments exist.`);
      }
    } catch (err: any) {
      setError(err.message || 'Route calculation failed');
    } finally {
      setLoading(false);
    }
  };

  // Convert geographic coordinates (Lat: 11.25..11.55, Lng: 77.40..77.85) to SVG viewbox (800 x 500)
  const minLat = 11.24;
  const maxLat = 11.50;
  const minLng = 77.40;
  const maxLng = 77.76;

  const toSvgX = (lng: number) => {
    const norm = (lng - minLng) / (maxLng - minLng);
    return Math.max(50, Math.min(750, 50 + norm * 700));
  };

  const toSvgY = (lat: number) => {
    // Invert lat because higher lat is North (top)
    const norm = (lat - minLat) / (maxLat - minLat);
    return Math.max(50, Math.min(450, 450 - norm * 400));
  };

  // Check if an edge is part of the Dijkstra calculated path
  const isEdgeInRoute = (edge: RoadEdge) => {
    if (!routeResult || !routeResult.reachable || !routeResult.orderedNodeCodes) return false;
    const codes = routeResult.orderedNodeCodes;
    for (let i = 0; i < codes.length - 1; i++) {
      const u = codes[i];
      const v = codes[i + 1];
      if (
        (edge.sourceNode.nodeCode === u && edge.targetNode.nodeCode === v) ||
        (edge.sourceNode.nodeCode === v && edge.targetNode.nodeCode === u)
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-lightBorder pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-softGreen text-forest text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-primaryGreen" />
            <span>Algorithm Demonstration</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Route Optimization & Road Graph
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Dijkstra's shortest-path algorithm executed in Java Spring Boot over our Erode road network.
          </p>
        </div>

        {/* Mandatory Academic Disclaimer Badge */}
        <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2 max-w-sm">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Illustrative sample road network — not live navigation.</span>
        </div>
      </div>

      {/* Route Selector Controls */}
      <div className="card-warm p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          <div className="md:col-span-5 space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-mutedText flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primaryGreen" />
              Source Junction / Hub
            </label>
            <select
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-darkText text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nodeName} ({n.areaName})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-mutedText flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orangeAccent" />
              Destination Junction
            </label>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-darkText text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nodeName} ({n.areaName})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => handleCalculate()}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-primaryGreen text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{loading ? 'Routing...' : 'Find Route'}</span>
            </button>
          </div>

        </div>

        {/* Preset demo shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-lightBorder text-xs text-mutedText">
          <span className="font-semibold text-darkText">Sample Route Demos:</span>
          <button
            onClick={() => { setSourceNodeId(1); setTargetNodeId(2); handleCalculate(1, 2); }}
            className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 font-medium"
          >
            Direct: Erode Jn → Bus Stand (1.8 km)
          </button>
          <button
            onClick={() => { setSourceNodeId(1); setTargetNodeId(7); handleCalculate(1, 7); }}
            className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 font-medium"
          >
            Multi-hop: Erode Jn → Perundurai (19.5 km)
          </button>
          <button
            onClick={() => { setSourceNodeId(5); setTargetNodeId(10); handleCalculate(5, 10); }}
            className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 font-medium"
          >
            Chithode → Gobi via Kavindapadi (26.3 km)
          </button>
          <button
            onClick={() => { setSourceNodeId(1); setTargetNodeId(11); handleCalculate(1, 11); }}
            className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium"
          >
            Unreachable Component Test (Node 11)
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Routing Notice:</span> {error}
          </div>
        </div>
      )}

      {/* SVG Interactive Visual Map */}
      <div className="card-warm p-6 space-y-4">
        <div className="flex justify-between items-center text-xs text-mutedText border-b border-lightBorder pb-3">
          <span className="font-bold uppercase tracking-wider text-forest">
            Visual Road Topology View
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-orangeAccent rounded"></span>
              <strong className="text-orangeAccent">Recommended Dijkstra Path</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#86A88B] rounded"></span>
              <span>Available Road Connections</span>
            </span>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative w-full bg-[#FAF7F0] rounded-2xl border border-lightBorder overflow-hidden shadow-inner flex items-center justify-center p-4">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-auto max-h-[500px]"
            style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))' }}
          >
            {/* Draw Edges */}
            {edges.map((edge) => {
              const x1 = toSvgX(Number(edge.sourceNode.longitude));
              const y1 = toSvgY(Number(edge.sourceNode.latitude));
              const x2 = toSvgX(Number(edge.targetNode.longitude));
              const y2 = toSvgY(Number(edge.targetNode.latitude));
              const active = isEdgeInRoute(edge);

              return (
                <g key={edge.id}>
                  {/* Road Edge Line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={active ? '#F58220' : '#BAC8B8'}
                    strokeWidth={active ? 5 : 2}
                    strokeDasharray={active ? 'none' : '4,3'}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Edge distance label */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 4}
                    fill={active ? '#C56208' : '#77766F'}
                    fontSize="9"
                    fontWeight={active ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="select-none"
                  >
                    {edge.distanceKm} km
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const cx = toSvgX(Number(node.longitude));
              const cy = toSvgY(Number(node.latitude));
              const isSource = node.id === sourceNodeId;
              const isTarget = node.id === targetNodeId;
              const inPath = routeResult?.orderedNodeCodes?.includes(node.nodeCode);

              return (
                <g key={node.id} className="cursor-pointer group">
                  {/* Outer pulse circle if source or target */}
                  {(isSource || isTarget) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill={isSource ? '#217A43' : '#F58220'}
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSource || isTarget ? 10 : inPath ? 8 : 6}
                    fill={
                      isSource
                        ? '#217A43'
                        : isTarget
                        ? '#F58220'
                        : inPath
                        ? '#F58220'
                        : '#14532D'
                    }
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className="transition-all"
                  />

                  {/* Node Label Text */}
                  <text
                    x={cx}
                    y={cy + 18}
                    fill="#18352A"
                    fontSize="10"
                    fontWeight={isSource || isTarget || inPath ? 'bold' : '500'}
                    textAnchor="middle"
                    className="select-none pointer-events-none drop-shadow-sm"
                  >
                    {node.nodeName}
                  </text>
                  <text
                    x={cx}
                    y={cy + 28}
                    fill="#77766F"
                    fontSize="8"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.areaName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Calculated Route Details Card */}
      {routeResult && routeResult.reachable && (
        <div className="card-warm p-6 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-lightBorder">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primaryGreen">Dijkstra Output</span>
              <h3 className="font-serif text-2xl font-bold text-forest mt-0.5">
                Optimal Shortest Route: {routeResult.totalDistanceKm} km
              </h3>
              <p className="text-xs text-mutedText mt-1">
                From <strong>{routeResult.sourceName}</strong> to <strong>{routeResult.targetName}</strong>
              </p>
            </div>

            {/* 15km Rule evaluation badge */}
            <div className={`p-3 rounded-xl border text-xs max-w-xs ${
              Number(routeResult.totalDistanceKm) <= 15
                ? 'bg-softGreen/30 border-softGreen text-forest'
                : 'bg-orange-50 border-orange-200 text-orange-950'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Truck className="w-4 h-4 text-primaryGreen shrink-0" />
                <span>15 km Transport Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {Number(routeResult.totalDistanceKm) <= 15
                  ? 'Total route is ≤ 15 km: Donor coordinates or requests local volunteer.'
                  : 'Total route is > 15 km: Recipient coordinates pickup or requests long-haul volunteer.'}
              </p>
            </div>
          </div>

          {/* Node progression trail */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedText block">
              Vertex Sequence
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {routeResult.orderedNodeNames.map((name, i) => (
                <React.Fragment key={i}>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    i === 0
                      ? 'bg-primaryGreen text-white border-primaryGreen'
                      : i === routeResult.orderedNodeNames.length - 1
                      ? 'bg-orangeAccent text-white border-orangeAccent'
                      : 'bg-cream-100 text-forest border-lightBorder'
                  }`}>
                    {name}
                  </span>
                  {i < routeResult.orderedNodeNames.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-mutedText shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Segments Table */}
          {routeResult.segments && routeResult.segments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-lightBorder rounded-xl overflow-hidden">
                <thead className="bg-cream-100 text-mutedText font-semibold uppercase tracking-wider border-b border-lightBorder">
                  <tr>
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-3">Road Name</th>
                    <th className="py-2.5 px-3">From</th>
                    <th className="py-2.5 px-3">To</th>
                    <th className="py-2.5 px-3 text-right">Distance (km)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder">
                  {routeResult.segments.map((seg, idx) => (
                    <tr key={idx} className="hover:bg-cream-50">
                      <td className="py-2.5 px-3 font-bold text-forest">Hop #{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-darkText">{seg.roadName}</td>
                      <td className="py-2.5 px-3 text-mutedText">{seg.fromNodeName}</td>
                      <td className="py-2.5 px-3 text-mutedText">{seg.toNodeName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-forest">{seg.distanceKm} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
