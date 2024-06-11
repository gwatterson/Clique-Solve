<script lang="ts">
import { ref } from 'vue';
// import showProperties from '@/components/GraphProperties.vue'
// export default showProperties;

export class Graph {
    adjacencyList = ref<Number[][]>([]);
    numberOfVertices = ref(0);
    numberOfEdges = ref(0);
    minDegree = ref(0);
    maxDegree = ref(0);
    density = ref(0);
  /*
    constructor(adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number) {
        this.adjacencyList = adjacencyList;
        this.numberOfVertices = ref(numberOfVertices);
        this.numberOfEdges = ref(numberOfEdges);
        this.minDegree = ref(0);
        this.maxDegree = ref(0);
        this.density = ref(0);
    }
    */

    setGraphAttributes(adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number) {
      this.adjacencyList.value = adjacencyList;
      this.numberOfVertices.value = numberOfVertices;
      this.numberOfEdges.value = numberOfEdges;
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

    // Method to display graph information
    displayGraphInfo() {
      // Show properties
      //showProperties.value = true;
      console.log("Graph Properties Displayed!");
    }
  
  }

</script>