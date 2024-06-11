import sys
import networkx as nx
import argparse
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# Function to find the maximum clique in the graph
def find_max_clique(graph):
    cliques = list(nx.find_cliques(graph))
    max_clique = max(cliques, key=len)
    return max_clique

# Function to execute find_max_clique with a timeout
def execute_with_timeout(graph, timeout):
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(find_max_clique, graph)
        try:
            result = future.result(timeout=timeout)
            return result
        except TimeoutError:
            raise TimeoutError("Execution timed out")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Find the maximum clique in a graph')
    parser.add_argument('--graph', type=str, help='Path to the adjacency list file')
    parser.add_argument('--time', type=int, help='Time limit for execution in seconds')
    args = parser.parse_args()

    if not args.graph or not args.time:
        parser.error('Both --graph and --time arguments are required')

    # Read the adjacency list file path
    adj_list_path = args.graph

    # Read the adjacency list from the file
    adjacency_list = []
    with open(adj_list_path, "r") as file:
        for node, line in enumerate(file, 1):  # Start from 1 for the first vertex
            # If the line is empty, the vertex has no neighbors
            if line.strip():
                neighbors = [int(neighbor) for neighbor in line.strip().split(' ')]
                adjacency_list.extend([(node, neighbor) for neighbor in neighbors])

    # Construct the graph from the edge list
    graph = nx.Graph(adjacency_list)

    try:
        # Find the maximum clique with a specified timeout
        max_clique = execute_with_timeout(graph, args.time)
        # Print the output
        print("Max Clique:")
        print(", ".join(map(str, max_clique)))  # Print without square brackets and with numbers separated by comma and space
    except TimeoutError as e:
        print("Execution timed out:", e)
