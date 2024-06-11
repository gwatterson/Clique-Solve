<template>
  <main>
    <div class="container">
      <form id="graphUploadForm" @submit.prevent="handleFileUpload">
        <input type="file" name="fileToUpload" id="fileToUpload" accept=".txt"><br><br>
        
        <label for="format">Select format:</label>
        <select v-model="selectedFormat" name="format" id="format">
          <option value="adjacency_list">Adjacency list</option>
          <option value="adjacency_matrix">Adjacency matrix</option>
          <option value="graph6_code">Graph6 code</option>
          <option value="dimacs_format">DIMACS format</option>
        </select><br><br>
        
        <input type="submit" value="Upload file">
      </form>
    </div>

    <div class="container">
      <div id="properties">
        <br>
        <h1 v-if="showProperties">Graph Properties</h1>
        <p v-if="showProperties">Number of Vertices: {{ graph.numberOfVertices }}</p>
        <p v-if="showProperties">Number of Edges: {{ graph.numberOfEdges }}</p>
        <p v-if="showProperties">Minimum Degree: {{ graph.minDegree }}, Maximum Degree: {{ graph.maxDegree }}</p>
        <p v-if="showProperties">Density: {{ Number(graph.density.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 }) }}</p>
      </div>
      <div class="svgContainer" id="graphVisualization"></div>
    </div>
  </main>
</template>


<script setup lang="ts">
import { ref } from 'vue';

let selectedFormat = ref('adjacency_list');
let showProperties = ref(false);

const handleFileUpload = () => {
  const fileInput = document.getElementById('fileToUpload') as HTMLInputElement;
  const file = fileInput.files![0];

  // Check if a file is selected
  if (!file) {
    alert('Select a file.');
    return;
  }

  // Check if the file has a .txt extension
  if (!file.name.endsWith('.txt')) {
    alert('File must be in a .txt format');
    return;
  }

  // Clear svg
  const graphVisualization = document.getElementById('graphVisualization');
  if(graphVisualization)
    graphVisualization.innerHTML = '';

  // Call the function graphProperties on the instance of the graph
  graph.graphProperties(file);
};

class Graph {
  adjacencyList = ref<Number[][]>([]);
  numberOfVertices = ref(0);
  numberOfEdges = ref(0);
  minDegree = ref(0);
  maxDegree = ref(0);
  density = ref(0);

  // Define the graphProperties method
  
  graphProperties(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (event) => {
      const graphData = event!.target!.result as string;
      const format = selectedFormat.value;

      switch (format) {
        case 'adjacency_matrix':
          var adjacencyMatrix = this.parseAdjacencyMatrix(graphData);
          this.numberOfVertices.value = adjacencyMatrix.length;
          this.numberOfEdges.value = this.countEdgesInMat(adjacencyMatrix);
          var minMaxDegreeInfo = this.MinMaxDegInMatrix(adjacencyMatrix);
          this.density.value = this.calculateDensity(this.numberOfVertices.value, this.numberOfEdges.value);
          this.displayGraphInfo(this.numberOfVertices.value, this.numberOfEdges.value, minMaxDegreeInfo.minDegree, minMaxDegreeInfo.maxDegree, this.density.value);
          this.displayGraphMatrix(adjacencyMatrix);
          break;
        case 'adjacency_list':
          var result = this.parseAdjacencyList(graphData);
          this.numberOfVertices.value = result.numberOfVertices;
          var adjacencyList = result.adjacencyList;
          this.numberOfEdges.value = this.countEdgesInList(adjacencyList);
          minMaxDegreeInfo = this.MinMaxDegInList(adjacencyList);
          this.density.value = this.calculateDensity(this.numberOfVertices.value, this.numberOfEdges.value);
          this.displayGraphInfo(this.numberOfVertices.value, this.numberOfEdges.value, minMaxDegreeInfo.minDegree, minMaxDegreeInfo.maxDegree, this.density.value);
          this.displayGraphList(adjacencyList, this.numberOfVertices.value);
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
    };

    console.log("End of Graph Properties");
  }
  
  /*
  graphProperties(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (event) => {
      const graphData = event!.target!.result as string;
      const format = selectedFormat.value;
      
      switch (format) {
      case 'adjacency_matrix':
        var result = this.adjacencyMatrixToAdjacencyList(graphData);
        break;
      case 'adjacency_list':
        var result = this.parseAdjacencyList(graphData);
        break;
      case 'graph6_code':
        var result = this.graph6ToAdjacencyList(graphData);
        break;
      case 'dimacs_format':
        var result = this.DimacsToAdjacencyList(graphData);
        break;
      default:
        alert('Unsupported format');
        break;
      }

      this.numberOfVertices.value = result.numberOfVertices;
      var adjacencyList = result.adjacencyList;
      this.numberOfEdges.value = this.countEdgesInList(adjacencyList);
      var minMaxDegreeInfo = this.MinMaxDegInList(adjacencyList);
      this.density.value = this.calculateDensity(this.numberOfVertices.value, this.numberOfEdges.value);
      this.displayGraphInfo(this.numberOfVertices.value, this.numberOfEdges.value, minMaxDegreeInfo.minDegree, minMaxDegreeInfo.maxDegree, this.density.value);
      this.displayGraphList(adjacencyList, this.numberOfVertices.value);
      
    };

    console.log("End of Graph Properties");
  }
  */

  // Method to display graph information
  displayGraphInfo(numberOfVert: number, numberOfEdges: number, minDegree: number, maxDeg: number, density: number) {
    // Display graph properties
    this.numberOfVertices.value = numberOfVert;
    this.numberOfEdges.value = numberOfEdges;
    this.minDegree.value = minDegree;
    this.maxDegree.value = maxDeg;
    this.density.value = density;

    // Show properties
    showProperties.value = true;
    console.log("Graph Properties Displayed!");
  }

  // Method to parse the file content and obtain the adjacency matrix
  parseAdjacencyMatrix(graphData: string) {
    // Split the string into lines
    const rows = graphData.trim().split('\n');
    const adjacencyMatrix: number[][] = [];

    // Iterate over the rows and create the adjacency matrix
    rows.forEach(row => {
      const rowValues = row.trim().split(/\s+/).map(Number);
      adjacencyMatrix.push(rowValues);
    });

    return adjacencyMatrix;
  }

  // Method to parse the file content and obtain the adjacency list
  parseAdjacencyList(graphData: string) {
    const adjacencyList: number[][] = [];
    let numberOfVertices = 0;

    // Split text into lines
    const lines = graphData.trim().split('\n');

    // Iterate over each line
    lines.forEach(line => {
      // Extract vertex number and its neighbors from the line
      const parts = line.trim().split(':');
      const vertex = parseInt(parts[0]);
      const neighbors = parts[1].trim().split(/\s+/).map(Number);

      // Update the maximum number of vertices
      if (vertex > numberOfVertices) {
        numberOfVertices = vertex;
      }

      // Ensure that adjacencyList has an array for each vertex
      if (!adjacencyList[vertex - 1]) {
        adjacencyList[vertex - 1] = [];
      }

      // Filter out '0' from the neighbors list
      const filteredNeighbors = neighbors.filter(neighbor => neighbor !== 0);

      // Add neighbors to the adjacency list
      adjacencyList[vertex - 1].push(...filteredNeighbors);
    });

    return { adjacencyList, numberOfVertices };
  }

  // Function to count the number of edges in the graph represented by an adjacency matrix
  countEdgesInMat(adjacencyMatrix: number[][]) {
    let numberOfEdges = 0;
    const numberOfVertices = adjacencyMatrix.length;

    for (let i = 0; i < numberOfVertices; i++) {
      for (let j = i + 1; j < numberOfVertices; j++) {
        if (adjacencyMatrix[i][j] === 1) {
          numberOfEdges++;
        }
      }
    }

    return numberOfEdges;
  }

  // Function to count the number of edges in the graph represented by an adjacency list
  countEdgesInList(adjacencyList: number[][]) {
    let numberOfEdges = 0;

    // Iterate over each vertex's neighbors
    adjacencyList.forEach(neighbors => {
      // If the vertex has no neighbors, it is a vertex with degree 0
      if (neighbors.length === 0) {
        return;
      }

      // Otherwise, count its neighbors as edges
      numberOfEdges += neighbors.length;
    });

    // Divide by 2 because each edge is counted twice (once for each vertex)
    return numberOfEdges / 2;
  }

  // Function to calculate the density of the graph
  calculateDensity(numberOfVertices: number, numberOfEdges: number) {
    if (numberOfVertices === 0 || numberOfVertices === 1) {
      return 1; // Graph with zero vertices has density = 1
    } else {
      const possibleEdges = numberOfVertices * (numberOfVertices - 1) / 2;
      return numberOfEdges / possibleEdges;
    }
  }

  // Function to calculate the minimum and maximum degree of the graph from an adjacency matrix
  MinMaxDegInMatrix(adjacencyMatrix: number[][]) {
    let minDegree = Infinity;
    let maxDegree = -Infinity;

    for (let i = 0; i < adjacencyMatrix.length; i++) {
      let degree = 0;
      for (let j = 0; j < adjacencyMatrix[i].length; j++) {
        degree += adjacencyMatrix[i][j];
      }
      if (degree < minDegree) {
        minDegree = degree;
      }
      if (degree > maxDegree) {
        maxDegree = degree;
      }
    }

    return { minDegree, maxDegree };
  }

  // Function to calculate the minimum and maximum degree of the graph from an adjacency list
  MinMaxDegInList(adjacencyList: number[][]) {
    let minDegree = Infinity;
    let maxDegree = 0;

    // Iterate over each vertex in the adjacency list
    adjacencyList.forEach(neighbors => {
      const degree = neighbors.length;
      if (degree < minDegree) {
        minDegree = degree;
      }
      if (degree > maxDegree) {
        maxDegree = degree;
      }
    });

    return { minDegree: minDegree === Infinity ? 0 : minDegree, maxDegree };
  }

  // Method to display graph matrix
  displayGraphMatrix(adjacencyMatrix: number[][]) {
    const graphVisualization = document.getElementById('graphVisualization');
    if (graphVisualization === null)
      return;

    const vertices = adjacencyMatrix.length;

    // Check if the number of vertices exceeds the limit
    if (vertices > 50) {
      graphVisualization.textContent = 'The graph is too large to be displayed.';
      return;
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    const vertexRadius = 10.5;
    const vertexSpacing = 360 / vertices;
    const center = { x: 150, y: 150 };

    // Draw edges
    for (let i = 0; i < vertices; i++) {
      for (let j = i + 1; j < vertices; j++) {
        if (adjacencyMatrix[i][j] === 1) {
          const x1y1 = this.getVertexCoordinates(center, vertexSpacing, i);
          const x2y2 = this.getVertexCoordinates(center, vertexSpacing, j);
          this.drawEdge(svg, x1y1, x2y2);
        }
      }
    }

    // Draw vertices
    for (let i = 0; i < vertices; i++) {
      const { x, y } = this.getVertexCoordinates(center, vertexSpacing, i);
      this.drawVertex(svg, x, y, vertexRadius, i + 1);
    }

    graphVisualization.appendChild(svg);
  }

  // Method to display graph list
  displayGraphList(adjacencyList: number[][], numberOfVertices: number) {
    const graphVisualization = document.getElementById('graphVisualization');
    if (graphVisualization === null)
      return;

    // Check if the number of vertices exceeds the limit
    if (numberOfVertices > 50) {
      graphVisualization.textContent = 'The graph is too large to be displayed.';
      return;
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    const vertexRadius = 10.5;
    const vertexSpacing = 360 / numberOfVertices;
    const center = { x: 150, y: 150 };

    // Draw edges
    for (let i = 0; i < numberOfVertices; i++) {
      const neighbors = adjacencyList[i];
      const { x: x1, y: y1 } = this.getVertexCoordinates(center, vertexSpacing, i);

      neighbors.forEach(neighbor => {
        const { x: x2, y: y2 } = this.getVertexCoordinates(center, vertexSpacing, neighbor - 1); // Correcting vertex index
        this.drawEdge(svg, { x: x1, y: y1 }, { x: x2, y: y2 });
      });
    }

    // Draw vertices
    for (let i = 0; i < numberOfVertices; i++) {
      const { x, y } = this.getVertexCoordinates(center, vertexSpacing, i);
      this.drawVertex(svg, x, y, vertexRadius, i + 1);
    }

    graphVisualization.appendChild(svg);
  }

  // Auxiliary method to get vertex coordinates
  getVertexCoordinates(center: { x: number, y: number }, vertexSpacing: number, index: number) {
    const angle = (index * vertexSpacing * Math.PI) / 180;
    const x = center.x + 120 * Math.cos(angle);
    const y = center.y + 120 * Math.sin(angle);
    return { x, y };
  }

  // Auxiliary method to draw an edge
  drawEdge(svg: SVGElement, startPoint: { x: number, y: number }, endPoint: { x: number, y: number }) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startPoint.x.toString());
    line.setAttribute('y1', startPoint.y.toString());
    line.setAttribute('x2', endPoint.x.toString());
    line.setAttribute('y2', endPoint.y.toString());
    line.setAttribute('stroke', 'lightgrey');
    svg.appendChild(line);
  }

  // Auxiliary method to draw a vertex
  drawVertex(svg: SVGElement, x: number, y: number, radius: number, label: number) {
    // Draw vertex circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', 'rgb(0, 189, 189)');
    svg.appendChild(circle);

    // Draw vertex label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'white');
    text.textContent = label.toString();
    svg.appendChild(text);
  }
}

// Create an instance of the Graph class
const graph = new Graph();
</script>
