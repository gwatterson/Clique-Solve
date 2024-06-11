<template>
    <div class="container">
      <div class="svgContainer" id="graphVisualization"></div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { Graph } from '@/assets/GraphClass.vue'; // Assuming Graph class is exported from Graph.ts
  
  const graph = new Graph();
  
  export function graphVisualization(graphData, format) {
    switch (format) {
      case 'adjacency_matrix':
        var adjacencyMatrix = graph.parseAdjacencyMatrix(graphData);
        graph.numberOfVertices.value = adjacencyMatrix.length;
        graph.numberOfEdges.value = graph.countEdgesInMat(adjacencyMatrix);
        var minMaxDegreeInfo = graph.MinMaxDegInMatrix(adjacencyMatrix);
        graph.density.value = graph.calculateDensity(graph.numberOfVertices.value, graph.numberOfEdges.value);
        graph.displayGraphInfo(graph.numberOfVertices.value, graph.numberOfEdges.value, minMaxDegreeInfo.minDegree, minMaxDegreeInfo.maxDegree, graph.density.value);
        graph.displayGraphMatrix(adjacencyMatrix);
        break;
      case 'adjacency_list':
        var result = graph.parseAdjacencyList(graphData);
        graph.numberOfVertices.value = result.numberOfVertices;
        var adjacencyList = result.adjacencyList;
        graph.numberOfEdges.value = graph.countEdgesInList(adjacencyList);
        minMaxDegreeInfo = graph.MinMaxDegInList(adjacencyList);
        graph.density.value = graph.calculateDensity(graph.numberOfVertices.value, graph.numberOfEdges.value);
        graph.displayGraphInfo(graph.numberOfVertices.value, graph.numberOfEdges.value, minMaxDegreeInfo.minDegree, minMaxDegreeInfo.maxDegree, graph.density.value);
        graph.displayGraphList(adjacencyList, graph.numberOfVertices.value);
        break;
      case 'graph6_code':
        // parsing for Graph6 code format
        break;
      case 'dimacs_format':
        // parsing for DIMACS format
        break;
      default:
        alert('Unsupported format');
        break;
    }
  }
  </script>
  