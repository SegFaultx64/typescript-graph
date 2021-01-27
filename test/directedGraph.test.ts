import { DirectedGraph, Graph } from '../src/'
import { NodeDoesntExistError } from '../src/errors'

/***
 * Directed Graph test
 */

describe("Directed Graph", () => {
  it("can be instantiated", () => {
    expect(new DirectedGraph<{}>()).toBeInstanceOf(DirectedGraph)
  })

  it("can calculate the indegree of a node", () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    expect(graph.indegreeOfNode('A')).toBe(0)
    expect(graph.indegreeOfNode('B')).toBe(0)
    expect(graph.indegreeOfNode('C')).toBe(0)
    expect(() => graph.indegreeOfNode('D')).toThrowError(NodeDoesntExistError)

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')
    graph.addEdge('C', 'A')

    expect(graph.indegreeOfNode('A')).toBe(1)
    expect(graph.indegreeOfNode('B')).toBe(1)
    expect(graph.indegreeOfNode('C')).toBe(2)


  })

  it("can determine if it is acyclical", () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    expect(graph.isAcyclic()).toBe(true)

    graph.addEdge('A', 'B')

    expect(graph.isAcyclic()).toBe(true)

    graph.addEdge('A', 'C')

    expect(graph.isAcyclic()).toBe(true)

    graph.addEdge('C', 'A');
    (graph as any).hasCycle = undefined;

    expect(graph.isAcyclic()).toBe(false)

    const graph2 = new DirectedGraph<NodeType>((n: NodeType) => n.name)
    graph2.insert({ name: 'A' })

    expect(graph2.isAcyclic()).toBe(true)

    graph2.addEdge('A', 'A');
    (graph2 as any).hasCycle = undefined;

    expect(graph2.isAcyclic()).toBe(false)

    const graph3 = new DirectedGraph<NodeType>((n: NodeType) => n.name)
    graph3.insert({ name: 'A' })
    graph3.insert({ name: 'B' })
    graph3.insert({ name: 'C' })
    graph3.insert({ name: 'D' })
    graph3.insert({ name: 'E' })

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('A', 'B')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('B', 'C')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('C', 'D')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('C', 'E')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('E', 'B');
    (graph3 as any).hasCycle = undefined;    

    expect(graph3.isAcyclic()).toBe(false)

    graph3.addEdge('E', 'C');
    (graph3 as any).hasCycle = undefined;

    expect(graph3.isAcyclic()).toBe(false)

    graph3.addEdge('E', 'E');
    (graph3 as any).hasCycle = undefined;

    expect(graph3.isAcyclic()).toBe(false)

  })

  it("can determine if adding an edge would create a cycle", () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    expect(graph.wouldAddingEdgeCreateCyle('A', 'B')).toBe(false)
    expect(graph.wouldAddingEdgeCreateCyle('A', 'A')).toBe(true)

    graph.addEdge('A', 'B')

    expect(graph.wouldAddingEdgeCreateCyle('B', 'C')).toBe(false)
    expect(graph.wouldAddingEdgeCreateCyle('B', 'A')).toBe(true)

    graph.addEdge('B', 'C')

    expect(graph.wouldAddingEdgeCreateCyle('A', 'C')).toBe(false)
    expect(graph.wouldAddingEdgeCreateCyle('C', 'A')).toBe(true)

  })



  it("can determine if one node can be reached from another", () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })
    graph.insert({ name: 'D' })

    expect(graph.canReachFrom('A', 'B')).toBe(false)
    expect(graph.canReachFrom('A', 'A')).toBe(false)

    graph.addEdge('A', 'B')

    expect(graph.canReachFrom('B', 'C')).toBe(false)
    expect(graph.canReachFrom('A', 'B')).toBe(true)
    expect(graph.canReachFrom('B', 'A')).toBe(false)

    graph.addEdge('B', 'C')
    graph.addEdge('B', 'D')

    expect(graph.canReachFrom('A', 'C')).toBe(true)
    expect(graph.canReachFrom('B', 'D')).toBe(true)
    expect(graph.canReachFrom('C', 'D')).toBe(false)

  })


  it("can return a subgraph based on walking from a start node", () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    const testGraph = new DirectedGraph<NodeType>((n: NodeType) => n.name);
    testGraph.insert({ name: 'A' })

    expect(graph.getSubGraphStartingFrom('A').getNodes()).toEqual(testGraph.getNodes())

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')

    const subGraph = graph.getSubGraphStartingFrom('A');

    expect(subGraph.getNodes()).toContainEqual({ name: 'A' })
    expect(subGraph.getNodes()).toContainEqual({ name: 'B' })
    expect(subGraph.getNodes()).toContainEqual({ name: 'C' })
    expect(subGraph.canReachFrom('A', 'C')).toBe(true);

    graph.insert({ name: 'D' })

    const subGraph2 = graph.getSubGraphStartingFrom('A');

    expect(subGraph2.getNodes()).not.toContainEqual({ name: 'D' })

    graph.addEdge('B', 'D')

    const subGraph3 = graph.getSubGraphStartingFrom('A');
    
    expect(subGraph3.getNodes()).toContainEqual({ name: 'D' })
    expect(subGraph3.canReachFrom('A', 'C')).toBe(true);
    expect(subGraph3.canReachFrom('A', 'D')).toBe(true);
    expect(subGraph3.canReachFrom('B', 'D')).toBe(true);
    expect(subGraph3.canReachFrom('C', 'D')).toBe(false);

  })

})