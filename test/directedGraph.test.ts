import DirectedGraph from '../src/directedGraph'
import { NodeDoesntExistError } from '../src/typescript-graph'
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

    expect(graph.inDegreeOfNode('A')).toBe(0)
    expect(graph.inDegreeOfNode('B')).toBe(0)
    expect(graph.inDegreeOfNode('C')).toBe(0)
    expect(() => graph.inDegreeOfNode('D')).toThrowError(NodeDoesntExistError)

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')
    graph.addEdge('C', 'A')

    expect(graph.inDegreeOfNode('A')).toBe(1)
    expect(graph.inDegreeOfNode('B')).toBe(1)
    expect(graph.inDegreeOfNode('C')).toBe(2)


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

    expect(graph.canReachFrom('A', 'B')).toBe(false)
    expect(graph.canReachFrom('A', 'A')).toBe(false)

    graph.addEdge('A', 'B')

    expect(graph.canReachFrom('B', 'C')).toBe(false)
    expect(graph.canReachFrom('A', 'B')).toBe(true)
    expect(graph.canReachFrom('B', 'A')).toBe(false)

    graph.addEdge('B', 'C')

    expect(graph.canReachFrom('A', 'C')).toBe(true)

  })

})