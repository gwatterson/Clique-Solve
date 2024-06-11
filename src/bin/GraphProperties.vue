<template>
  <div class="container">
    <div id="properties">
      <br>
      <h1 v-if="showProperties">Graph Properties</h1>
      <p v-if="showProperties">Number of Vertices: {{ graph.numberOfVertices }}</p>
      <p v-if="showProperties">Number of Edges: {{ graph.numberOfEdges }}</p>
      <p v-if="showProperties">Minimum Degree: {{ graph.minDegree }}, Maximum Degree: {{ graph.maxDegree }}</p>
      <p v-if="showProperties">Density: {{ Number(graph.density.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 }) }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { graphVisualization } from './GraphVisualization';

const showProperties = ref(false);

export function graphProperties(file, selectedFormat) {
  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = (event) => {
    const graphData = event.target.result;

    graphVisualization(graphData, selectedFormat);
  };
}
</script>
