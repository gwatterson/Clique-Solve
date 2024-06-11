<template>
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
</template>

<script>
import { graphProperties } from './GraphProperties';

export default {
  data() {
    return {
      selectedFormat: 'adjacency_list'
    };
  },
  methods: {
    handleFileUpload() {
      const fileInput = document.getElementById('fileToUpload');
      const file = fileInput.files[0];

      if (!file) {
        alert('Select a file.');
        return;
      }

      if (!file.name.endsWith('.txt')) {
        alert('File must be in a .txt format');
        return;
      }

      graphProperties(file, this.selectedFormat);
    }
  }
};
</script>
