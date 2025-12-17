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
        <form id="MaxCliqueMenu">
          <label for="options">Select one of the algorithms: <br></label>
          <select v-model="selectedAlgorithm" id="opzioni">
            <option value="greedy">Greedy</option>
            <option value="backtracking">Backtracking</option>
            <option value="branch_and_bound">Branch & bound by Grigory Zhigalov (external)</option>
            <option value="genetic">Genetic algorithm by Shalin Shah (external)</option>
            <option value="networkX">NetworkX algorithm (external)</option>
          </select>
          <div v-if="paramTimeLimit || selectedAlgorithm == 'backtracking'">
            <input type="number" v-model="timeLimit" placeholder="Time limit (s)" min="0" max="60"> seconds
          </div>
          <div v-if="paramNumIterations">
              <input type="number" v-model="numIterations" placeholder="Iterations" min="1" max="1000"> iterations
          </div>
          <br><br>
          <button v-if="showCliqueButton || selectedAlgorithm == 'greedy' || selectedAlgorithm == 'backtracking'" class="submitButton" @click="handleMaxClique" type="button">Find Max-Clique</button>
          <br>
          <button v-if="!(selectedAlgorithm == 'greedy' || selectedAlgorithm == 'backtracking')" class="submitButton" @click="handleServerCall" type="button">Select external algorithm</button>
        </form>
      </div>
      <div class="innerContainer">
        <div class="textContainer" id="maxCliqueVisualization">
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
import axios from 'axios';
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
const showCliqueButton = ref(false);
const cliqueSize = ref(0);
const selectedAlgorithm = ref('greedy');
const paramTimeLimit = ref(false);
const paramNumIterations = ref(false);
const timeLimit = ref(0);
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
  paramNumIterations.value = false;
  paramTimeLimit.value = false;

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

interface ServerResponse {
  extension: string;
  path: string;
  format: string;
  parameters: { name: string; type: string }[];
  command: string;
}

var algoData: ServerResponse;

async function handleServerCall () {
  try {
    // Make a call to the server
    const response = await axios.post('http://localhost:3000/load_json', { algorithm: selectedAlgorithm.value });

    // Extract extension and parameters from the response
    const { extension, path, format, parameters, command }: ServerResponse = response.data;

    // Check if timeLimit and numIterations are among the parameters
    paramTimeLimit.value = parameters.some(param => param.name == 'timeLimit');
    paramNumIterations.value = parameters.some(param => param.name == 'numIterations');

    algoData = {
      extension: extension,
      path: path,
      format: format,
      parameters: parameters,
      command: command
    };

    showCliqueButton.value = true;

  } catch (error) {
    console.error('Error:', error);
    // Handle errors
    console.error('An error occurred while calling the server');
    }
}

async function handleExternalMaxClique () {
  var output = '';
  const filePath = algoData.path;
  let convertedGraphFile = '';
  switch (algoData.format) {
    case 'dimacs':
      convertedGraphFile = parseFunctions.adjacencyListToDimacs(adjacencyList, numberOfVertices.value, numberOfEdges.value);
      break;
    case 'adjacency_list':
      convertedGraphFile = adjacencyList.map(row => row.join(' ')).join('\n');
      break;
    case 'adjacency_matrix':
      convertedGraphFile = parseFunctions.adjacencyListToMatrix(adjacencyList, numberOfVertices.value);
    case 'graph6':
      convertedGraphFile = parseFunctions.adjacencyListToGraph6(adjacencyList, numberOfVertices.value);
      break;
    default:
      console.error('The input format of the external algorithm is not supported');
      break;
  }

  if(numberOfEdges.value == 0) {
    maxClique = [1];
    return;
  }

  switch (algoData.extension) {
    case '.exe':
      try {
        const formData = new FormData();

        // Read the file from the existing file path
        const blob = await fetch(filePath).then(response => response.blob());
        const exeFile = new File([blob], 'a.exe', { type: 'application/octet-stream' });

        formData.append('executable', exeFile);

        formData.append('graphFile', convertedGraphFile);
        if (paramNumIterations.value) {
          formData.append('numIterations', numIterations.value.toString());
        } else {
          formData.append('numIterations', '');
        }
        if (paramTimeLimit.value) {
          formData.append('timeLimit', timeLimit.value.toString());
        } else {
          formData.append('timeLimit', '');
        }

        formData.append('callFormat', algoData.command);

        const response = await fetch('http://localhost:3000/execute-exe', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error during file upload.');
        }

        output = await response.text();
       
        console.log('Output: \n', output);
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during file upload.');
      }
      break;
    case '.py':
      try {
        const formData = new FormData();

        if (paramTimeLimit.value && timeLimit.value == 0) {
          timeLimit.value = 60;
        }

        // Leggi il contenuto del file Python
        const response = await fetch(filePath);
        const pythonCode = await response.text();

        formData.append('pythonCode', pythonCode);
        formData.append('graphFile', convertedGraphFile);
        
        if (paramNumIterations.value) {
          formData.append('numIterations', numIterations.value.toString());
        } else {
          formData.append('numIterations', '');
        }
        if (paramTimeLimit.value) {
          formData.append('timeLimit', timeLimit.value.toString());
        } else {
          formData.append('timeLimit', '');
        }

        formData.append('callFormat', algoData.command);

        // Invia la richiesta al server
        const executeResponse = await fetch('http://localhost:3000/execute-python', {
          method: 'POST',
          body: formData
        });

        // Controlla se la richiesta è stata eseguita con successo
        if (!executeResponse.ok) {
          alert('Error executing Python script');
          return;
        }

        // Leggi e visualizza l'output
        output = await executeResponse.text();
        console.log('Output: \n', output);
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the request');
      }
      break;
    default:
      console.error('Extension not supported');
  }


  // -----------------------------------------------------------------
  // output of external algorithm is parsed by reading the line that follows the word 'Clique'
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
}

const handleMaxClique = async () => {
  // Clear Max-Clique result
  maxClique = [];
  showCliqueButton.value = false;
  showMaxClique.value = false;
  showMessGreedy.value = false;
  showSpinnerClique.value = true; // Show the spinner before executing the algorithm
  partialResult.value = false;

  // Function to handle partial result
  function handlePartialResult (clique: number[]) {
    cliqueSize.value = clique.length;
    console.log('Partial result:', clique.join(', '));
    console.log('cliqueSize:', cliqueSize.value);
  };

  setTimeout(async () => {
    try {
      // Measure the start time
      time.value = performance.now();
      var externalTimeOut = false;

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
        default:
          await handleExternalMaxClique();
          cliqueSize.value = maxClique.length;
          if (isNaN(maxClique[0]) || maxClique.length == 0) {
            externalTimeOut = true;
          }
          break;
      }

      // Measure the end time and calculate the execution time
      time.value = performance.now() - time.value;

      if(Math.abs(timeLimit.value * 1000 - time.value) < 100 && timeLimit.value != 0) {
        partialResult.value = true;
      }

      if (externalTimeOut) {
        alert('The external algorithm has exceeded the time limit');
      }
      else {
        showMaxClique.value = true;
        displayFunctions.displayGraphList(adjacencyList, numberOfVertices.value, maxClique);
      }
      
      showSpinnerClique.value = false;
      paramNumIterations.value = false;
      paramTimeLimit.value = false;
    } catch (error) {
      // Handle errors
      console.error(error);
      alert('An error occurred while finding the Max-Clique');
    }
  }, 10);
};

</script>