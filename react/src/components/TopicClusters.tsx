'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CompleteDocument } from '@/types/bhb';

interface Props {
  data: CompleteDocument;
}

interface TopicNode {
  name: string;
  value: number;
  children?: TopicNode[];
}

interface ProcessedTopicData {
  name: string;
  children: TopicNode[];
}

function processTopicData(data: CompleteDocument): ProcessedTopicData {
  const topics = new Map<string, Set<string>>();

  if (!data?.notes) return { name: "Topics", children: [] };

  data.notes.forEach(note => {
    note.tokens.forEach(token => {
      let topic = token.category;
      if (!topic || topic.toLowerCase() === 'notapplicable') {
        topic = token.usage;
      }
      if (!topic || topic.toLowerCase() === 'notapplicable') {
        topic = token.nameType;
      }

      if (topic && topic.toLowerCase() !== 'notapplicable') {
        if (!topics.has(topic)) {
          topics.set(topic, new Set());
        }
        topics.get(topic)?.add(token.lemma || token.spelling);
      }
    });
  });

  return {
    name: "Topics",
    children: Array.from(topics.entries())
      .filter(([, terms]) => terms.size > 0)
      .sort((a, b) => b[1].size - a[1].size)
      .map(([category, terms]) => ({
        name: category,
        value: terms.size,
        children: Array.from(terms).map(term => ({
          name: term,
          value: 1
        }))
      }))
  };
}

export default function TopicClusters({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || dimensions.width === 0 || dimensions.height === 0) return;

    const processedData = processTopicData(data);
    if (processedData.children.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }
    const width = dimensions.width;
    const height = dimensions.height;

    d3.select(svgRef.current).selectAll("*").remove();

    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "absolute hidden p-2 bg-gray-800 text-gray-100 text-xs rounded border border-gray-700 shadow-lg z-10")
      .style("pointer-events", "none");

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const g = svg.append('g');

    const colorScale = d3.scaleOrdinal()
      .domain(processedData.children.map(d => d.name))
      .range(d3.schemeTableau10);

    const pack = d3.pack<TopicNode>()
      .size([width * 0.9, height * 0.9])
      .padding(3);

    const root = d3.hierarchy<TopicNode>({
      name: processedData.name,
      value: 0,
      children: processedData.children
    })
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const nodes = pack(root);

    const node = g.selectAll(".node")
      .data(nodes.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("cursor", d => d.children ? "pointer" : "default")
      .on("click", (event, d) => {
        event.stopPropagation();

        if (selectedTopic === d.data.name) {
          setSelectedTopic(null);
        } else {
          setSelectedTopic(d.data.name);
        }

        if (d.children) {
          const scale = Math.min(4, 800 / (d.r * 2));
          svg.transition().duration(750).call(
            zoom.transform as any,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(scale)
              .translate(-d.x, -d.y)
          );
        }
      })
      .on("mouseover", (event, d) => {
        tooltip
          .html(`
            <div class="font-semibold">${d.data.name}</div>
            ${d.children ?
              `<div>${d.children.length} terms</div>` :
              `<div>Term in ${d.parent?.data.name}</div>`
            }
            <div>Value: ${d.value}</div>
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .classed("hidden", false);

        d3.select(event.currentTarget)
          .select("circle")
          .transition()
          .duration(200)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
      })
      .on("mouseout", (event) => {
        tooltip.classed("hidden", true);

        d3.select(event.currentTarget)
          .select("circle")
          .transition()
          .duration(200)
          .attr("stroke", (d: any) => d.children ? "#4a5568" : "none")
          .attr("stroke-width", (d: any) => d.children ? 1 : 0);
      });

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => {
        if (!d.parent) return "transparent";
        const color = colorScale(d.children ? d.data.name : d.parent.data.name) as string;
        const d3Color = d3.color(color);
        if (!d3Color) return color;
        return d.children ? d3Color.darker(0.3).toString() : d3Color.brighter(0.5).toString();
      })
      .attr("fill-opacity", d => d.children ? 0.7 : 0.5)
      .attr("stroke", d => d.children ? "#4a5568" : "none")
      .attr("stroke-width", d => d.children ? 1 : 0);

    node.filter(d => d.r > 10)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", d => Math.min(d.r / 3, 14))
      .attr("fill", "#e2e8f0")
      .attr("pointer-events", "none")
      .text(d => {
        const name = d.data.name;
        const maxLength = Math.floor(d.r / 3);
        return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
      });

    node.append("circle")
      .attr("r", d => d.r + 5)
      .attr("fill", "none")
      .attr("stroke", "#4299e1")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", d => selectedTopic === d.data.name ? 0.8 : 0)
      .attr("class", "node-highlight")
      .attr("pointer-events", "none");

    if (selectedTopic) {
      node.filter(d => d.data.name === selectedTopic)
        .select(".node-highlight")
        .attr("stroke-opacity", 0.8);
    }

    svg.on("click", () => {
      setSelectedTopic(null);
      svg.transition().duration(750).call(
        zoom.transform as any,
        d3.zoomIdentity
      );
    });

    svg.call(
      zoom.transform as any,
      d3.zoomIdentity
        .translate(width * 0.05, height * 0.05)
    );

  }, [data, dimensions, selectedTopic]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-gray-800 p-3 rounded-lg border border-gray-700 text-xs text-gray-300">
        <div className="font-semibold mb-2 text-blue-300">Legend</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 opacity-70 mr-2"></div>
          <span>Topic clusters</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-300 opacity-50 mr-2"></div>
          <span>Individual terms</span>
        </div>
        <div className="mt-2 text-gray-400">
          Click to zoom, double-click to reset
        </div>
      </div>
    </div>
  );
} 