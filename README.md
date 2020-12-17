# typescript-graph

This library provides some basic graph data structures and algorithms.

Full docs are availible [here](https://segfaultx64.github.io/typescript-graph/).

It supports undirected graphs, directed graphs and directed acyclic graphs (including inforcing acyclicality). It does not support weighted graphs at this time.

The graphs created with this library can have nodes of any type, however at present it does not support attaching metadata to edges.

The most useful functionality is the ability to compute cyclicality and topological sort order on [[`DirectedAcyclicGraph`]]s. This can be used for determining things like task order or tracing dependencies. 

## Installing & Basic Usage

```bash
npm install 'typescript-graph'
```

```typescript
import { Graph } from 'typescript-graph'

// Identify the node type to be used with the graph
type NodeType = { name: string, count: number, metadata: { [string: string]: string } }
// Define a custom identity function with which to identify nodes
const graph = new Graph<NodeType>((n: NodeType) => n.name)

// Insert nodes into the graph
const node1 = graph.insert({name: 'node1', count: 45, metadata: {color: 'green'}})
const node2 = graph.insert({name: 'node2', count: 5, metadata: {color: 'red', style: 'normal'}})
const node3 = graph.insert({name: 'node3', count: 15, metadata: {color: 'blue', size: 'large'}})

// Add edges between the nodes we created.
graph.addEdge(node1, node2)
graph.addEdge(node2, node3)
```

## Examples

### Creating a directed graph and detecting cycles.

```typescript
import { DirectedGraph, DirectedAcyclicGraph } from 'typescript-graph'

// Create the graph
type NodeType = { name: string, count: number }
const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

// Insert nodes into the graph
const node1 = graph.insert({name: 'node1', count: 45})
const node2 = graph.insert({name: 'node2', count: 5})
const node3 = graph.insert({name: 'node3', count: 15})

// Check for cycles
console.log(graph.isAcyclic()) // true

// Add edges between the nodes we created.
graph.addEdge(node1, node2)
graph.addEdge(node2, node3)

// Check for cycles again
console.log(graph.isAcyclic()) // still true

// Converts the graph into one that enforces acyclicality
const dag = DirectedAcyclicGraph.fromDirectedGraph(graph)

// Try to add an edge that will cause an cycle
dag.addEdge(node3, node1) // throws an exception

// You can add the edge that would cause a cycle on the preview graph
graph.addEdge(node3, node1)

// Check for cycles again
console.log(graph.isAcyclic()) // now false

DirectedAcyclicGraph.fromDirectedGraph(graph) // now throws an exception because graph is not acyclic
```

### Creating a directed acyclic graph and getting the nodes in topological order

```typescript
import { DirectedAcyclicGraph } from 'typescript-graph'

// Create the graph
type NodeType = { name: string }
const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

// Insert nodes into the graph
const node1 = graph.insert({name: 'node1'})
const node2 = graph.insert({name: 'node2'})
const node3 = graph.insert({name: 'node3'})
const node4 = graph.insert({name: 'node4'})
const node5 = graph.insert({name: 'node5'})

// Add edges
graph.addEdge(node1, node2)
graph.addEdge(node2, node4)
graph.addEdge(node1, node3)
graph.addEdge(node3, node5)
graph.addEdge(node5, node4)

// Get the nodes in topologically sorted order
graph.topologicallySortedNodes() // returns roughly [{ name: 'node1' }, { name: 'node3' }, { name: 'node5' }, { name: 'node2' }, { name: 'node4' }]
```

## License
MIT License

## Author
Max Walker (max@maxwalker.me)
