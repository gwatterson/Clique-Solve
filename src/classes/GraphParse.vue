<script lang="ts">
export default class GraphParse {
  adjacencyList: number[][] = [];
  numberOfVertices: number = 0;
  numberOfEdges: number = 0;

  parseUploadedGraph(file: File, format: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = (event) => {
        const graphData = event.target!.result as string;
        let result: any;

        switch (format) {
            case 'adjacency_matrix':
                result = this.adjacencyMatrixToAdjacencyList(graphData);
                break;
            case 'adjacency_list':
                result = this.parseAdjacencyList(graphData);
                break;
            case 'graph6_code':
                result = this.graph6ToAdjacencyList(graphData);
                break;
            case 'dimacs_format':
                result = this.DimacsToAdjacencyList(graphData);
                break;
            default:
                reject(new Error('Unsupported format'));
                return;
        }

        // Set the parsed graph data
        this.adjacencyList = result.adjacencyList;
        this.numberOfVertices = result.numberOfVertices;
        this.numberOfEdges = result.numberOfEdges;

        resolve();
      };

      reader.onerror = () => {
        reject(new Error('Error while reading file'));
      };
    });
  }

  // Method to analyze the file content and obtain the adjacency list
  private parseAdjacencyList(graphData: string): { adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number } {
    const adjacencyList: number[][] = [];
    let numberOfVertices = 0;

    // Split the text into lines
    const lines = graphData.trim().split('\n');

    // Iterate over each line
    lines.forEach(line => {
      // Extract the vertex number and its neighbors from the line
      const parts = line.trim().split(':');
      const vertex = parseInt(parts[0]);
      const neighbors = parts[1].trim().split(/\s+/).map(Number);

      // Update the maximum number of vertices
      if (vertex > numberOfVertices) {
        numberOfVertices = vertex;
      }

      // Ensure adjacencyList has an array for each vertex
      if (!adjacencyList[vertex - 1]) {
        adjacencyList[vertex - 1] = [];
      }

      // Filter out '0' from the neighbors list
      const filteredNeighbors = neighbors.filter(neighbor => neighbor !== 0);

      // Add neighbors to the adjacency list
      adjacencyList[vertex - 1].push(...filteredNeighbors);
    });

    // Count the number of edges in the adjacency list
    let numberOfEdges = this.countEdgesInList(adjacencyList);

    return { adjacencyList, numberOfVertices, numberOfEdges };
  }


  private adjacencyMatrixToAdjacencyList(graphData: string): { adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number } {
    const lines: string[] = graphData.trim().split('\n');
    const adjacencyList: number[][] = [];
    let numberOfVertices: number = 0;

    lines.forEach((line, index) => {
        const row: number[] = line.trim().split(' ').map(Number);

        if (index === 0) {
            numberOfVertices = row.length;
        }

        const neighbors: number[] = [];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === 1) {
                neighbors.push(j + 1);
            }
        }

        adjacencyList.push(neighbors);
    });

    let numberOfEdges = this.countEdgesInList(adjacencyList);

    return { adjacencyList, numberOfVertices, numberOfEdges };
}

  private graph6ToAdjacencyList(graph6: string): { adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number } {
    let vertices: number;
    let binList: string = "";

    // Check if the first two characters are '~?'
    if (graph6.slice(0, 2) === '~?') {
        // Decode the number of vertices
        vertices = (graph6.charCodeAt(2) - 63) * 64 + (graph6.charCodeAt(3) - 63);
        // Start processing from the fourth character
        graph6 = graph6.slice(4);
    } else {
        // Otherwise, calculate the number of vertices from the first character
        vertices = graph6.charCodeAt(0) - 63;
        // Start processing from the second character
        graph6 = graph6.slice(1);
    }

    // Convert to binary and concatenate into one string
    for (let i = 0; i < graph6.length; i++) {
        binList += (graph6.charCodeAt(i) - 63).toString(2).padStart(6, '0');
    }

    const adjacencyList: number[][] = [];

    let index: number = 0;
    for (let i = 0; i < vertices; i++) {
        const neighbors: number[] = [];
        for (let j = 0; j < i; j++) {
            const isConnected: number = parseInt(binList[index]);
            if (isConnected === 1) {
                neighbors.push(j + 1);
                adjacencyList[j].push(i + 1); // Add the reverse edge
            }
            index++;
        }
        adjacencyList.push(neighbors);
    }

    let numberOfEdges = this.countEdgesInList(adjacencyList);
    
    return { adjacencyList: adjacencyList, numberOfVertices: vertices, numberOfEdges: numberOfEdges };
}

  private DimacsToAdjacencyList(graphData: string): { adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number } {
    let adjacencyList: number[][] = [];
    let numberOfVertices: number = 0;
    let numberOfEdges: number = 0;

    // Split text into lines
    const lines: string[] = graphData.trim().split('\n');

    // Iterate over each line
    lines.forEach(line => {
        // Skip comment lines
        if (line.startsWith('c')) return;

        // Parse problem line or edge descriptor line
        if (line.startsWith('p')) {
            const parts: string[] = line.trim().split(/\s+/);
            numberOfVertices = parseInt(parts[2]);
            // Initialize adjacencyList
            adjacencyList = Array.from({ length: numberOfVertices }, () => []);
            numberOfEdges = parseInt(parts[3]);
            return;
        } else if (line.startsWith('e')) {
            const parts: string[] = line.trim().split(/\s+/);
            const u: number = parseInt(parts[1]);
            const v: number = parseInt(parts[2]);
            // Add edge to adjacency list
            adjacencyList[u - 1].push(v);
            adjacencyList[v - 1].push(u); // Assuming undirected graph
        }
    });

    return { adjacencyList: adjacencyList, numberOfVertices: numberOfVertices, numberOfEdges: numberOfEdges };
}

adjacencyListToDimacs(adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number): string {
    let dimacsString = '';

    // Add the problem line
    dimacsString += `p edge ${numberOfVertices} ${numberOfEdges}\n`;

    // Add the edge descriptors
    for (let i = 0; i < numberOfVertices; i++) {
        const neighbors = adjacencyList[i];
        for (let j = 0; j < neighbors.length; j++) {
            const neighbor = neighbors[j];
            // Add the edge descriptor line only if it hasn't been added before
            if (i < neighbor) {
                dimacsString += `e ${i + 1} ${neighbor}\n`;
            }
        }
    }

    return dimacsString;
}

adjacencyListToMatrix(adjacencyList: number[][], numberOfVertices: number): string {
    let matrixString = '';

    // Add the adjacency matrix
    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < numberOfVertices; j++) {
            if (j > 0) {
                matrixString += ' ';
            }
            matrixString += adjacencyList[i].includes(j + 1) ? '1' : '0';
        }
        matrixString += '\n';
    }

    return matrixString;
}

adjacencyListToGraph6(adjacencyList: number[][], numberOfVertices: number): string {
    let graph6 = "";

    // Encode the number of vertices
    if (numberOfVertices <= 63) {
        graph6 += String.fromCharCode(numberOfVertices + 63);
    } else {
        graph6 += "~?" + String.fromCharCode((numberOfVertices >> 6) + 63) + String.fromCharCode((numberOfVertices & 63) + 63);
    }

    // Convert adjacency list to binary string
    let binList = "";
    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < i; j++) { // Iterate over the lower triangular part
            if (adjacencyList[i].includes(j + 1)) {
                binList += "1";
            } else {
                binList += "0";
            }
        }
    }

    // Convert binary string to graph6 format
    let chunk = "";
    for (let i = 0; i < binList.length; i += 6) {
        chunk = binList.substr(i, 6).padEnd(6, '0');
        graph6 += String.fromCharCode(parseInt(chunk, 2) + 63);
    }

    return graph6;
}

  // Private method to count the number of edges in the graph represented by an adjacency list
  private countEdgesInList(adjacencyList: number[][]): number {
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
}
</script>