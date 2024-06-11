<script lang="ts">
export default class GraphVisualization {
  // Method to display the graph list
  displayGraphList(adjacencyList: number[][], numberOfVertices: number, maxClique: number[] = []) {
    this.clearElement();

    const graphVisualization = document.getElementById('graphVisualization');

    if (!graphVisualization)
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

    // Draw the edges
    for (let i = 0; i < numberOfVertices; i++) {
      const neighbors = adjacencyList[i];
      const { x: x1, y: y1 } = this.getVertexCoordinates(center, vertexSpacing, i);

      neighbors.forEach(neighbor => {
        const { x: x2, y: y2 } = this.getVertexCoordinates(center, vertexSpacing, neighbor - 1); // Vertex index correction
        this.drawEdge(svg, { x: x1, y: y1 }, { x: x2, y: y2 });
      });
    }

    // Draw the vertices
    for (let i = 0; i < numberOfVertices; i++) {
      const { x, y } = this.getVertexCoordinates(center, vertexSpacing, i);
      if (maxClique.includes(i + 1))
        this.drawVertex(svg, x, y, vertexRadius, i + 1, 'rgb(255, 0, 0)');
      else
        this.drawVertex(svg, x, y, vertexRadius, i + 1);
    }

    graphVisualization.appendChild(svg);
  }

  clearElement() {
    const graphVisualization = document.getElementById('graphVisualization');
    if (graphVisualization)
      graphVisualization.innerHTML = '';
  }

  // Helper method to get vertex coordinates
  private getVertexCoordinates(center: { x: number, y: number }, vertexSpacing: number, index: number) {
    const angle = (index * vertexSpacing * Math.PI) / 180;
    const x = center.x + 120 * Math.cos(angle);
    const y = center.y + 120 * Math.sin(angle);
    return { x, y };
  }

  // Helper method to draw an edge
  private drawEdge(svg: SVGElement, startPoint: { x: number, y: number }, endPoint: { x: number, y: number }) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startPoint.x.toString());
    line.setAttribute('y1', startPoint.y.toString());
    line.setAttribute('x2', endPoint.x.toString());
    line.setAttribute('y2', endPoint.y.toString());
    line.setAttribute('stroke', 'lightgrey');
    svg.appendChild(line);
  }

  // Helper method to draw a vertex
  private drawVertex(svg: SVGElement, x: number, y: number, radius: number, label: number, color: string = 'rgb(0, 189, 189)') {
    // Draw the vertex circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', color);
    svg.appendChild(circle);

    // Draw the vertex label
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
</script>