<template>
  <main>
    <div class="graphContainer">
      <div class="innerContainer">
        <form id="graphUploadForm" @submit.prevent="handleFileUpload">
          <input type="file" name="fileToUpload" id="fileToUpload" accept=".txt"><br><br>
          
          <label for="format">Select format: </label>
          <select v-model="selectedFormat" name="format" id="format">
            <option value="adjacency_list">Adjacency list</option>
            <option value="adjacency_matrix">Adjacency matrix</option>
            <option value="graph6_code">Graph6 code</option>
            <option value="dimacs_format">DIMACS format</option>
          </select><br><br>
          
          <input class="submitButton" type="submit" value="Upload file">
        </form>
      </div>

      <div class="innerContainer">
        <div class="textContainer" id="properties">
          <div v-if='showSpinnerParse' id="spinnerContainer" class="spinner"></div>
          <br>
          <h1 v-if="showProperties">Graph Properties</h1>
          <p v-if="showProperties">Number of Vertices: {{ numberOfVertices }}</p>
          <p v-if="showProperties">Number of Edges: {{ numberOfEdges }}</p>
          <p v-if="showProperties">Minimum Degree: {{ minDegree }}</p>
          <p v-if="showProperties">Maximum Degree: {{ maxDegree }}</p>
          <p v-if="showProperties">Density: {{ Number(density).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 }) }}</p>
        </div>
        <div class="outputContainer" id="graphVisualization"></div>
      </div>
    </div>

    <div v-if="showProperties" class="cliqueContainer">
      <div class="innerContainer">
        <form id="MaxCliqueMenu" @submit.prevent="handleMaxClique">
          <label for="options">Select one of the algorithms: <br></label>
          <select v-model="selectedAlgorithm" id="opzioni">
            <option value="greedy">Greedy</option>
            <option value="backtracking">Backtracking</option>
            <option value="brute_force">Brute-Force</option>
            <option value="import_py">Import Pyton file</option>
            <option value="import_exe">Import exe file</option>
          </select>
          <div v-if="selectedAlgorithm == 'backtracking'">
            <input type="number" v-model="timeLimit" placeholder="Time limit (s)" min="0" max="60"> seconds
          </div>
          <br><br>
          <button v-if="selectedAlgorithm != 'import_py' && selectedAlgorithm != 'import_exe'" class="submitButton" type="submit">Find Max-Clique</button>
        </form>
        <form v-if="selectedAlgorithm == 'import_py'" id="uploadPyForm" @submit.prevent="handleMaxClique" enctype="multipart/form-data">
            <input type="file" id="pyFileInput" accept=".py"><br><br>
            <input type="number" v-model="timeLimit" placeholder="Time limit (s)" min="0" max="60"> seconds <br><br>
            <button class="submitButton" type="submit">Run py to find Max-Clique</button>
        </form>
        <form v-if="selectedAlgorithm == 'import_exe'" id="uploadExeForm" @submit.prevent="handleMaxClique" enctype="multipart/form-data">
            <input type="file" id="exeFileInput" accept=".exe"><br><br>
            <label for="inputs">What are the inputs of your algorithm? <br></label>
            <select v-model="exeInputs" id="opzioni">
              <option value="1">Graph file</option>
              <option value="2">Graph file and iterations</option>
            </select>
            <div v-if="exeInputs == 2">
              <input type="number" v-model="numIterations" placeholder="Iterations" min="1" max="1000"> iterations
            </div>
            <br><br>
            <button class="submitButton" type="submit">Run exe to find Max-Clique</button>
        </form>
      </div>
      <div class="innerContainer">
        <div class="textContainer" id="maxCliqueVisualization">
          <div id="partSize" v-if="partialSize">Partial size: {{ cliqueSize }}</div>
          <div v-if='showSpinnerClique' id="spinnerContainer" class="spinner"></div>
          <h1 v-if="showMaxClique">Max-Clique</h1>
          <p v-if="showMaxClique">Size: {{ cliqueSize }}</p>
          <p v-if="showMaxClique">Vertices: {{ maxClique.join(', ') }}</p>
          <p v-if="showMessGreedy && showMaxClique">The Clique found by the greedy algorithm may not be the Max-Clique</p>
          <p v-if="partialResult && showMaxClique">You have set a time limit: the resulting Clique may not be the Max-Clique</p>
          <p v-if="showMaxClique && !showSpinnerClique">Time of execution: {{ Number(time).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 6 }) }} ms</p>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup lang="ts">
import { h, nextTick, ref, watch } from 'vue';
// import axios from 'axios';
import GraphParse from '@/classes/GraphParse.vue';
import GraphProperties from '@/classes/GraphProperties.vue';
import GraphVisualization from '@/classes/GraphVisualization.vue';
import MaxCliqueAlgorithms from '@/classes/MaxClique.vue';

var graphFile: File;

const selectedFormat = ref('adjacency_list');
const showProperties = ref(false);
const showMaxClique = ref(false);
const showMessGreedy = ref(false);
const showSpinnerParse = ref(false);
const showSpinnerClique = ref(false);
const partialResult = ref(false);
const partialSize = ref(false);
const cliqueSize = ref(0);
const selectedAlgorithm = ref('greedy');
const timeLimit = ref(0);
const exeInputs = ref(1);
const numIterations = ref(100);

const numberOfVertices = ref(0);
const numberOfEdges = ref(0);
const maxDegree = ref(0);
const minDegree = ref(0);
const density = ref(0);
const time = ref(0);
var adjacencyList: number[][] = [];
var maxClique: number[] = [];

const parseFunctions = new GraphParse();
const propertiesFunctions = new GraphProperties();
const displayFunctions = new GraphVisualization();
const maxCliqueFunctions = new MaxCliqueAlgorithms();

const handleFileUpload = async () => {
  // Clear previous results
  showMaxClique.value = false;
  showMessGreedy.value = false;
  showProperties.value = false;

  displayFunctions.clearElement();

  // Get the file
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

  // Shows that the result is loading
  showSpinnerParse.value = true;

  graphFile = file;

  await parseFunctions.parseUploadedGraph(file, selectedFormat.value);
  adjacencyList = parseFunctions.adjacencyList;
  numberOfVertices.value = parseFunctions.numberOfVertices;
  numberOfEdges.value = parseFunctions.numberOfEdges;

  const minMaxDegInfo = propertiesFunctions.MinMaxDegInList(adjacencyList);
  minDegree.value = minMaxDegInfo.minDegree;
  maxDegree.value = minMaxDegInfo.maxDegree;
  density.value = propertiesFunctions.calculateDensity(numberOfVertices.value, numberOfEdges.value);

  displayFunctions.displayGraphList(adjacencyList, numberOfVertices.value);

  showProperties.value = true;
  showSpinnerParse.value = false;
};

async function handlePy() {
  // Use type assertion to specify the type of HTMLElement
  const pyFileInput = document.getElementById('pyFileInput') as HTMLInputElement;
  
  // Check if the input is valid and has uploaded files
  if (!pyFileInput.files || pyFileInput.files.length === 0) {
    alert('Select a Python file');
    return;
  }

  // Get the first uploaded file
  const file = pyFileInput.files[0];

  // Read the content of the Python file
  const pythonCode = await file.text();

  let convertedGraphFile: string = parseFunctions.adjacencyListToDimacs(adjacencyList, numberOfVertices.value, numberOfEdges.value);

  if (timeLimit.value == 0) {
    timeLimit.value = 60;
    return;
  }

  // Send the request to the server
  const response = await fetch('http://localhost:4000/execute-python', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pythonCode,
      graphFile: convertedGraphFile,
      timeLimit: timeLimit.value
    })
  });

  // Check if the request was successful
  if (!response.ok) {
    alert('Error executing Python script');
    return;
  }

  // Read and display the output
  const output = await response.text();

  // -----------------------------------------------------------------
  // edit this part depending on the output of your .exe file
  const outputLines = output.split('\n');
  let resultLines = [];
  let includeNextLine = false;
  for (let i = 0; i < outputLines.length; i++) {
    if (outputLines[i].includes('Clique')) {
      includeNextLine = true;
    } else if (includeNextLine) {
      resultLines.push(outputLines[i]);
      includeNextLine = false;
    }
  }
  const result = resultLines.join('\n');
  maxClique = result.trim().split(' ').map(val => parseInt(val, 10));
  // -----------------------------------------------------------------
  
};

async function handleExe() {
  const exeFileInput = document.getElementById('exeFileInput') as HTMLInputElement;
  if (!exeFileInput.files || exeFileInput.files.length === 0) {
    alert('Select an .exe file.');
    return Promise.reject(new Error('No file selected.'));
  }

  const exeFile = exeFileInput.files[0];

  if (!exeFile) {
    alert('No file selected.');
    return Promise.reject(new Error('No file selected.'));
  }

  let convertedGraphFile: File = new File([parseFunctions.adjacencyListToDimacs(adjacencyList, numberOfVertices.value, numberOfEdges.value)], 'graph.txt', { type: 'text/plain' });

  const formData = new FormData();
  formData.append('executable', exeFile);
  formData.append('graphFile', convertedGraphFile);
  if(exeInputs.value == 2)
    formData.append('numIterations', numIterations.value.toString());
  else
    formData.append('numIterations', '');

  return fetch('http://localhost:3000/execute-exe', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error during file upload.');
    }
    return response.text();
  })
  .then(output => {
    // Open a new browser window containing the complete text of the output
    const newWindow = window.open('', '_blank', 'width=1,height=1,left=-1000,top=-1000');
    if (newWindow) {
      newWindow.document.write('<pre>' + output + '</pre>');
    } else {
      alert('Failed to open new window. Please check your browser settings to allow pop-ups.');
    }

    // -----------------------------------------------------------------
    // edit this part depending on the output of your .exe file
    const outputLines = output.split('\n');
    let resultLines = [];
    let includeNextLine = false;
    for (let i = 0; i < outputLines.length; i++) {
      if (outputLines[i].includes('Clique')) {
        includeNextLine = true;
      } else if (includeNextLine) {
        resultLines.push(outputLines[i]);
        includeNextLine = false;
      }
    }
    const result = resultLines.join('\n');
    maxClique = result.trim().split(' ').map(val => parseInt(val, 10));
    // -----------------------------------------------------------------
  })
  .catch(error => {
    alert(error.message);
    return Promise.reject(error);
  });
}

/*
const handleUploadExe = async () => {
  const exeFileInput = document.getElementById('exeFileInput') as HTMLInputElement;
  const exeFile = exeFileInput.files![0];

  if (!exeFile) {
    alert('Select an .exe file.');
    return;
  }

  const formData = new FormData();
  formData.append('exeFile', exeFile);

  try {
    const response = await fetch('http://localhost:3000/upload-exe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload and execute the .exe file');
    }

    const output = await response.text();
    console.log('Output:', output); // Output received from the server
  } catch (error) {
    console.error('Error uploading and executing the .exe file:', error);
  }
};
*/

const handleMaxClique = async () => {
  // Clear Max-Clique result
  maxClique = [];
  partialSize.value = (selectedAlgorithm.value == 'backtracking');
  showMaxClique.value = false;
  showMessGreedy.value = false;
  showSpinnerClique.value = true; // Show the spinner before executing the algorithm
  partialResult.value = false;

  // Function to handle partial result
  function handlePartialResult (clique: number[]) {
    partialSize.value = true;
    cliqueSize.value = clique.length;
    partialSize.value = false;
    console.log('Partial result:', clique.join(', '));
    console.log('cliqueSize:', cliqueSize.value);
  };

  setTimeout(async () => {
    try {
      // Measure the start time
      time.value = performance.now();

      switch (selectedAlgorithm.value) {
        case 'greedy':
          showMessGreedy.value = true;
          maxClique = maxCliqueFunctions.greedyMaxClique(adjacencyList, numberOfVertices.value);
          cliqueSize.value = maxClique.length;
          break;
        case 'backtracking':
          maxClique = maxCliqueFunctions.backtrackingMaxClique(adjacencyList, numberOfVertices.value, numberOfEdges.value, timeLimit.value, handlePartialResult);
          cliqueSize.value = maxClique.length;
          break;
        case 'brute_force':
          maxClique = maxCliqueFunctions.bruteForceMaxClique(adjacencyList);
          cliqueSize.value = maxClique.length;
          break;
        case 'import_exe':
          await handleExe();
          console.log('Max-Clique:', maxClique);
          cliqueSize.value = maxClique.length;
          break;
        case 'import_py':
          await handlePy();
          console.log('Max-Clique:', maxClique);
          cliqueSize.value = maxClique.length;
          break;
      }

      // Measure the end time and calculate the execution time
      time.value = performance.now() - time.value;

      if(Math.abs(timeLimit.value * 1000 - time.value) < 100 && timeLimit.value != 0) {
        partialResult.value = true;
      }

      // Update the UI to show the result and hide the spinner
      partialSize.value = false;
      showMaxClique.value = true;
      displayFunctions.displayGraphList(adjacencyList, numberOfVertices.value, maxClique);
      showSpinnerClique.value = false;
    } catch (error) {
      // Handle errors
      console.error(error);
      alert('An error occurred while finding the Max-Clique');
    }
  }, 10);
};

</script>
