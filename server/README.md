To add additional external algorithms to the application, copy the file of your algorithm in the folder /src/external_algorithms.
You can add a python algorithm (extension .py), or a pre-compiled code (format .exe). No other format are supported for now.

Make sure to edit the file algoConfig.json in the server folder, adding all the required information for your algorithm:

        {
        "name": "",
        "path": "",
        "extension": "",
        "format": "",
        "parameters": [
          {
            "name": "graphFile.txt",
            "type": "file"
          },
          {
            "name": "",
            "type": ""
          }
        ],
        "call_format": ""
      }

The path should be "src/external_algorithms/yourFile.extension"

The extension can be ".py" or ".exe"

The format is referred to the graph representation format that your algorithm receives as input. The application currently supports adjacency list, adjacency matrix, DIMACS format and Graph6 format.

The first parameter should be the graph file. You should nod edit this part since it is automatically renamed by the application as soon as you upload it on the page.

Then, make sure to add all the required input parametres for your algorithm. For now, the app supports the input of two possible parametres: timeLimit and numOfIterations.

The call format should specify the command line that launches your algorithm. Write it as a string, with variable names written in the following format:
    ${varName}
Always use "graphFilePath" to refer to the relative path of the graph file, "executablePath" or "pythonFilePath" to refer to the file path of your algorithm and "numIterations" and "timeLimit" to refer to the parametres. Different ways of calling the variables are not recognized by the app.
    ex. "call_format": "${executablePath} ${graphFilePath} ${numIterations}"

Furthemore, make sure that the output of your algorithm contains the Max Clique in the following way:
  ...
  ... Clique:
  1 2 5 6 7
  ...

It's not relevant if the output contains other type of information or text, the app will only read the line that follows the word "Clique".

Before adding a new algorithm to this application, always check its license and copiright.
