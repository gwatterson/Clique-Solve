<script lang="ts">
import GraphProperties from './GraphProperties.vue';
const propertiesFunctions = new GraphProperties();
export default class MaxCliqueAlgorithms {
    greedyMaxClique(adjacencyList: number[][], numVertices: number): number[] {
        if (adjacencyList.length === 0) {
            return [];
        }
        
        // Remove empty rows from the adjacency list and store the indices of the remaining vertices
        const remainingIndices: number[] = [];
        for (let i = 0; i < numVertices; i++) {
            if (adjacencyList[i].length > 0) {
                remainingIndices.push(i + 1); // Add 1 to get the correct index in the original graph
            }
        }

        if (remainingIndices.length === 0) {
            return [1]; // No vertices left, return vertex 1
        }
        
        const maxClique: number[] = []; // Set that will contain the maximum clique

        // Auxiliary function to check if a vertex can be added to the current clique
        function canAddToClique(vertex: number, currentClique: number[]): boolean {
            return currentClique.every((v) => adjacencyList[vertex - 1].includes(v));
        }

        // Greedy algorithm to find the maximum clique among the remaining vertices
        for (let i = 0; i < remainingIndices.length; i++) {
            const currentVertex = remainingIndices[i];
            const currentClique: number[] = [currentVertex]; // Start with the current vertex as clique
            for (let j = i + 1; j < remainingIndices.length; j++) {
                const nextVertex = remainingIndices[j];
                if (canAddToClique(nextVertex, currentClique)) {
                    currentClique.push(nextVertex); // Add vertex j to the current clique
                }
            }
            if (currentClique.length > maxClique.length) {
                maxClique.splice(0, maxClique.length, ...currentClique); // Update the maximum clique
            }
        }

        return maxClique;
    }

    backtrackingMaxClique(adjacencyList: number[][], numberOfVertices: number, numberOfEdges: number, timeLimit: number, onPartialResult: (clique: number[]) => void): number[] {
        let maxClique: number[] = [];
        let visited: boolean[] = Array(numberOfVertices).fill(false);
        let degree: number[] = Array(numberOfVertices).fill(0);
        timeLimit = timeLimit || 60; // Default time limit of 60 seconds
        let startTime: number = Date.now(); // Start time of function execution

        const density = propertiesFunctions.calculateDensity(numberOfVertices, numberOfEdges);

        // If the graph is a complete graph, return all vertices
        if (density == 1) {
            return Array.from({ length: numberOfVertices }, (_, i) => i + 1);
        }

        // Pre-calculate degrees
        for (let i = 0; i < numberOfVertices; i++) {
            degree[i] = adjacencyList[i].length;
        }

        // Sort vertices by degree (descending order)
        const sortedVertices = Array.from({ length: numberOfVertices }, (_, i) => i + 1)
            .sort((a, b) => degree[b - 1] - degree[a - 1]);

        // Function to check if a set of vertices forms a clique
        function isClique(vertices: number[]): boolean {
            for (let i = 0; i < vertices.length; i++) {
                for (let j = i + 1; j < vertices.length; j++) {
                    if (!adjacencyList[vertices[i] - 1].includes(vertices[j])) {
                        return false;
                    }
                }
            }
            return true;
        }
        
        // Backtracking function to find maximum clique
        function backtrack(candidate: number[], start: number) {
            if (Date.now() - startTime >= timeLimit * 1000) {
                return;
            }
            if (candidate.length > maxClique.length && isClique(candidate)) {
                maxClique = candidate.slice();
                onPartialResult(maxClique);
            }
            for (let i = start; i <= numberOfVertices; i++) {
                if (!visited[i - 1] && candidate.length + numberOfVertices - i + 1 > maxClique.length) {
                    visited[i - 1] = true;
                    const nextCandidate = candidate.concat(i);
                    backtrack(nextCandidate, i + 1);
                    visited[i - 1] = false;
                }
            }
        }
        
        // Start the backtracking from each unvisited vertex
        for (let i = 0; i < sortedVertices.length; i++) {
            visited.fill(false); // Reset visited array
            visited[sortedVertices[i] - 1] = true; // Mark the starting vertex as visited
            backtrack([sortedVertices[i]], sortedVertices[i] + 1);
        }
        
        return maxClique;
    }

}
</script>