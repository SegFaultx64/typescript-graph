import { DirectedGraph, DirectedAcyclicGraph } from '../src/'
import { CycleError } from '../src/errors'

/***
 * Directed Acyclic Graph test
 */

describe("Directed Acyclic Graph", () => {
  it("can be instantiated", () => {
    expect(new DirectedAcyclicGraph<{}>()).toBeInstanceOf(DirectedAcyclicGraph)
  })

  it("can be converted from a directed graph", () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')

    expect(DirectedAcyclicGraph.fromDirectedGraph(graph)).toBeInstanceOf(DirectedAcyclicGraph)
    
    graph.addEdge('C', 'A')

    expect(() => DirectedAcyclicGraph.fromDirectedGraph(graph)).toThrow(CycleError)
  })


  it("can add an edge only if it wouldn't create a cycle", () => {
    type NodeType = { name: string }
    const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')

    expect(() => graph.addEdge('C', 'A')).toThrow(CycleError)
  })

  it("can get it's nodes topologically sorted", () => {
    type NodeType = { name: string }
    const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

    expect(graph.topologicallySortedNodes()).toEqual([])

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    const topoList1 = graph.topologicallySortedNodes();

    expect(topoList1).toContainEqual({ name: 'A' })
    expect(topoList1).toContainEqual({ name: 'B' })
    expect(topoList1).toContainEqual({ name: 'C' })

    graph.addEdge('A', 'C')
    graph.addEdge('C', 'B')

    const topoList2 = graph.topologicallySortedNodes();

    expect(topoList2).toEqual([{ name: 'A' }, { name: 'C' }, { name: 'B' }])
    
    graph.insert({ name: 'D' })
    graph.insert({ name: 'E' })

    graph.addEdge('A', 'D')
    graph.addEdge('B', 'E')
    
    const topoList3 = graph.topologicallySortedNodes();

    expect(topoList3[0]).toEqual({ name: 'A' })
    expect(topoList3[4]).toEqual({ name: 'E' })

    expect([{ name: 'C' }, { name: 'D' }]).toContainEqual(topoList3[1])
    expect([{ name: 'C' }, { name: 'D' }]).toContainEqual(topoList3[2])

    graph.insert({ name: 'F' })

    const topoList4 = graph.topologicallySortedNodes();

    expect(topoList4).toContainEqual({ name: 'F' })
    expect([{ name: 'A' }, { name: 'F' }]).toContainEqual(topoList4[0])
    expect([{ name: 'A' }, { name: 'F' }]).toContainEqual(topoList4[1])
  })

})