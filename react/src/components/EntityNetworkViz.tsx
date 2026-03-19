'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EntityData } from '@/types/bhb';

interface Props {
  data: EntityData;
  onNodeSelect?: (nodeId: string) => void;
}

export default function EntityNetworkViz({ data, onNodeSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "transparent");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create container group
    const g = svg.append('g');

    // Create a deterministic seed based on node id
    const seedFromString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash) / 2147483647;
    };

    const nodesWithPosition = data.nodes.map((node) => {
      const seed1 = seedFromString(`${node.id}`);
      const seed2 = seedFromString(`${node.id}${node.name}`);

      const x = width / 2 + (seed1 - 0.5) * width * 0.8;
      const y = height / 2 + (seed2 - 0.5) * height * 0.8;

      return {
        ...node,
        x,
        y,
      };
    });

    const simulation = d3.forceSimulation(nodesWithPosition as any)
      .force("link", d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide().radius(40))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const links = g.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#4a5568")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1);

    const nodes = g.append("g")
      .selectAll<SVGGElement, any>("g")
      .data(nodesWithPosition)
      .join("g")
      .call((g) => g.call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)))
      .on('click', (event, d: any) => {
        event.stopPropagation();
        onNodeSelect?.(d.id);
      });

    nodes.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.type === "person" ? "#f6ad55" :
        d.type === "organization" ? "#63b3ed" :
          d.type === "place" ? "#68d391" :
            d.type === "thing" ? "#fc8181" :
              "#d6bcfa")
      .attr("stroke", "#0a0a0a")
      .attr("stroke-width", 2);

    nodes.append("text")
      .text((d: any) => d.name)
      .attr("x", 10)
      .attr("y", 4)
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#e2e8f0")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    nodes.style("cursor", "pointer");

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Initial scale to fit
    svg.call(zoom.transform as any, d3.zoomIdentity.scale(0.8).translate(width * 0.1, height * 0.1));

  }, [data, onNodeSelect]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}