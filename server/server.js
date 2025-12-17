const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const { time } = require('console');
const fsProm = require('fs').promises; // Using fs.promises to handle asynchronous operations with Promises

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Definisci il percorso della cartella uploads
const uploadDir = path.join(__dirname, 'uploads');

// Se la cartella non esiste, creala
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Cartella "uploads" creata automaticamente!');
}

// Route to load algorithm information from algoConfig.json
app.post('/load_json', async (req, res) => {
  try {
    const algorithmName = req.body.algorithm;

    // Read algorithm information from algoConfig.json file
    const algoConfigPath = path.join(__dirname, 'algoConfig.json');
    const algoConfigData = fs.readFileSync(algoConfigPath, 'utf-8');
    const algoConfig = JSON.parse(algoConfigData);

    // Find the requested algorithm information
    const algorithm = algoConfig.algorithms.find(algo => algo.name === algorithmName);

    if (!algorithm) {
      return res.status(404).send('Algorithm not found');
    }

    // Send algorithm information to the client
    res.send({
      extension: algorithm.extension,
      path: algorithm.path,
      format: algorithm.format,
      parameters: algorithm.parameters,
      command: algorithm.call_format
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to upload an .exe file
app.post('/execute-exe', async (req, res) => {
  try {
    if (!req.files || !req.files.executable) {
      return res.status(400).send('No file uploaded.');
    }

    // Remove files from the "uploads" folder
    await emptyUploadsFolder(uploadDir);

    const executable = req.files.executable;
    const graphFile = req.body.graphFile; // Get the "graphFile" file from the request body
    const numIterations = req.body.numIterations; // Get the "iterations" parameter from the request body
    const timeLimit = req.body.timeLimit; // Get the "timeLimit" parameter from the request body
    const command = req.body.callFormat; // Get the "command" parameter from the request body

    const graphFileStream = Readable.from(graphFile);
    const graphFileWriteStream = fs.createWriteStream(path.join(uploadDir, 'graphFile.txt'));
    graphFileStream.pipe(graphFileWriteStream);
  
    // Save the new files in the "uploads" folder
    await executable.mv(path.join(uploadDir, executable.name));

    const output = await executeExecutable(command, path.join(uploadDir, executable.name), path.join(uploadDir, 'graphFile.txt'), timeLimit, numIterations);

    res.send(output);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post('/execute-python', async (req, res) => {
  try {
    // Read data sent by the client
    const { pythonCode, graphFile, callFormat, timeLimit, numIterations } = req.body;

    // Make sure the data is defined and not empty
    if (!pythonCode || !graphFile) {
      return res.status(400).send('Python code and graph file are required');
    }

    // Remove files from the "uploads" folder
    await emptyUploadsFolder(uploadDir);

    // Write the Python code to a temporary file using streams
    const pythonCodeStream = Readable.from(pythonCode);
    const pythonCodeWriteStream = fs.createWriteStream('uploads/temp.py');
    pythonCodeStream.pipe(pythonCodeWriteStream);

    // Write the graph file to a temporary file using streams
    const graphFileStream = Readable.from(graphFile);
    const graphFileWriteStream = fs.createWriteStream('uploads/graphFile.txt');
    graphFileStream.pipe(graphFileWriteStream);

    const pythonFilePath = path.join(uploadDir, 'temp.py');
    const graphFilePath = path.join(uploadDir, 'graphFile.txt');

    const commandLine = `${callFormat.replace(/\$\{(\w+)\}/g, (match, varName) => eval(varName))}`;

    // When the writing is complete, proceed with executing the Python script
    pythonCodeWriteStream.on('finish', () => {
      // Execute the command using exec
      exec(commandLine, (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing command:', error);
          res.status(500).send('Error executing command');
          return;
        }
        if (stderr) {
          console.error('Command execution returned an error:', stderr);
          res.status(500).send('Command execution returned an error');
          return;
        }
        // Handle the output as needed
        res.send(stdout);
      });
    });
  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).send('Internal server error');
  }
});


// Function to remove files from the "uploads" folder
async function emptyUploadsFolder(uploadDir) {
  const files = await fsProm.readdir(uploadDir);
  for (const file of files) {
    await fsProm.unlink(path.join(uploadDir, file));
  }
}

// Function to execute the .exe file
function executeExecutable(command, executablePath, graphFilePath, timeLimit, numIterations) {
  const commandLine = `${command.replace(/\$\{(\w+)\}/g, (match, varName) => eval(varName))}`;

  return new Promise((resolve, reject) => {
    exec(commandLine, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
  });
}


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
