# CliqueSolve 🔍

**CliqueSolve** is a web application designed to read, parse, and analyze undirected graphs to identify their main properties and find the **Maximum Clique**. Developed by **Guelfo Watterson** during the Academic Year 2023/24 at **KU Leuven (Gent)**, this project was supervised by **Professor Tony Wauters**.

The application serves as a fast, easy-to-use, and expandable tool for programmers and mathematicians to handle the NP-hard problem of finding the largest subset of vertices where every pair is connected.

## 🚀 Key Features

* **Graph Upload & Parsing**: Support for `.txt` graph files in multiple formats.


* **Properties Analysis**: Automatic calculation of number of vertices, edges, density, and min/max degrees.


* **Visualization**: Graphical rendering for graphs with fewer than 50 vertices.


* **Max Clique Solvers**: Five different algorithms available, running both on the front-end and back-end.



## 📂 Supported Graph Formats

CliqueSolve can process graphs represented as:

* **Adjacency List**: Memory-efficient for sparse graphs.


* **Adjacency Matrix**: Ideal for quick edge lookup.


* **DIMACS Format**: Standard text-based format for graph research.


* **Graph6 Format**: Compact encoding using printable ASCII characters.



## 🧠 Available Algorithms

The application implements a variety of solving strategies:

1. **Greedy Algorithm**: Provides a fast approximation; runs in TypeScript on the front-end.


2. **Backtracking Algorithm**: Guarantees finding the exact maximum clique with an optional time limit; runs on the front-end.


3. **Branch & Bound (Grigory Zhigalov)**: A Python-based approach running on the back-end.


4. **NetworkX Algorithm**: Uses the `max_clique` function from the NetworkX Python library.



## 🛠️ Tech Stack & Architecture

The project follows a modern decoupled architecture:

* **Front-end**: Built with **Vue.js 3** and **TypeScript** for high maintainability and flexibility.


* **Back-end**: A **Node.js** server (Express & Cors) used to execute external algorithms written in Python and C++.


* **Deployment**: Optimized for **AWS (EC2)** using **Nginx** as a web server.



## 💻 Getting Started

### Prerequisites

* Node.js and npm 


* Vue CLI and Vite (`npm install -g @vue/cli vite`) 


* Python 3 (for back-end algorithms) 



### Local Setup

1. **Build the Front-end**:
```bash
cd MaxClique_project
npm install
npm run build
[cite_start]``` [cite: 162, 165, 168]

```


2. **Run the Server**:
```bash
cd MaxClique_project/server
node server.js
[cite_start]``` [cite: 159, 160]


```



---

**Author:** Guelfo Watterson (KU Leuven) 

**Supervisor:** Prof. Tony Wauters 

**References:** Includes open-source algorithms by Shalin Shah and Grigory Zhigalov.
