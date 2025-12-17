<script lang="ts">
export default class GraphProperties {
  // Function to calculate the graph density
  calculateDensity(numberOfVertices: number, numberOfEdges: number): number {
    if (numberOfVertices == 0 || numberOfVertices == 1) {
      return 1; // Graph with zero vertices has density = 1
    } else {
      const possibleEdges = numberOfVertices * (numberOfVertices - 1) / 2;
      return numberOfEdges / possibleEdges;
    }
  }

  // Function to calculate the minimum and maximum degree of the graph from an adjacency list
  MinMaxDegInList(adjacencyList: number[][]): { minDegree: number, maxDegree: number } {
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
}
</script>