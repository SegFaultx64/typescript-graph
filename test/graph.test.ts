import { NodeAlreadyExistsError, NodeDoesntExistError } from '../src/errors'
import { Graph } from '../src/'
var hash = require('object-hash')

/***
 * Graph test
 */

describe('Graph', () => {
  it('can be instantiated', () => {
    expect(new Graph<{}>()).toBeInstanceOf(Graph)
  })

  it('can add a node', () => {
    const graph = new Graph<{ a: number; b: string }>()

    graph.insert({ a: 1, b: 'b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)

    expect(() => {
      graph.insert({ a: 1, b: 'b' })
    }).toThrow(NodeAlreadyExistsError)
    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
  })

  it('can add a node with custom identity function', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)

    expect(() => {
      graph.insert({ a: 1, b: 'not b' })
    }).toThrow(NodeAlreadyExistsError)
    expect(() => {
      graph.insert({ a: 1.0007, b: 'not b' })
    }).toThrow(NodeAlreadyExistsError)

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)

    graph.insert({ a: 2, b: 'not b' })

    expect((graph as any).nodes.size).toBe(2)
    expect((graph as any).adjacency.length).toBe(2)
    expect((graph as any).adjacency[0].length).toBe(2)
  })

  it('can replace a node', () => {
    const graph = new Graph<{ a: number; b: string }>()

    graph.insert({ a: 1, b: 'b' })
    graph.replace({ a: 1, b: 'b' })

    expect(() => {
      graph.replace({ a: 1, b: 'c' })
    }).toThrow(NodeDoesntExistError)
    expect((graph as any).nodes.get(hash({ a: 1, b: 'c' }))).toBeUndefined()

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get(hash({ a: 1, b: 'b' }))).toEqual({ a: 1, b: 'b' })
  })

  it('can replace a node with custom identity function', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })
    graph.replace({ a: 1, b: 'not b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get('1.00')).toBeDefined()
    expect((graph as any).nodes.get('1.00')).toEqual({ a: 1, b: 'not b' })

    graph.replace({ a: 1.0007, b: 'not b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get('1.00')).toBeDefined()
    expect((graph as any).nodes.get('1.00')).toEqual({ a: 1.0007, b: 'not b' })

    expect(() => {
      graph.replace({ a: 2.5, b: 'c' })
    }).toThrow(NodeDoesntExistError)
    expect((graph as any).nodes.get('2.50')).toBeUndefined()
  })

  it('can upsert a node', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })
    graph.upsert({ a: 1, b: 'not b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get('1.00')).toBeDefined()
    expect((graph as any).nodes.get('1.00')).toEqual({ a: 1, b: 'not b' })

    graph.upsert({ a: 2.5, b: 'super not b' })

    expect((graph as any).nodes.size).toBe(2)
    expect((graph as any).adjacency.length).toBe(2)
    expect((graph as any).adjacency[0].length).toBe(2)
    expect((graph as any).nodes.get('2.50')).toBeDefined()
    expect((graph as any).nodes.get('2.50')).toEqual({ a: 2.5, b: 'super not b' })
  })

  it('can add an edge', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })

    expect(() => graph.addEdge('3.00', '2.00')).toThrow(NodeDoesntExistError)
    expect(() => graph.addEdge('1.00', '2.00')).toThrow(NodeDoesntExistError)
    expect(() => graph.addEdge('2.00', '1.00')).toThrow(NodeDoesntExistError)

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 3, b: 'b' })
    graph.insert({ a: 4, b: 'b' })

    graph.addEdge('1.00', '2.00')
    expect((graph as any).adjacency[0][1]).toBe(1)
    expect((graph as any).adjacency[1][0]).toBeFalsy()
    expect((graph as any).adjacency[1][2]).toBe(0)

    graph.addEdge('2.00', '1.00')
    expect((graph as any).adjacency[0][1]).toBe(1)
    expect((graph as any).adjacency[1][0]).toBe(1)
    expect((graph as any).adjacency[1][2]).toBeFalsy()
  })

  it('can return the nodes', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })

    expect(graph.getNodes()).toEqual([{ a: 1, b: 'b' }])

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 3, b: 'b' })
    graph.insert({ a: 4, b: 'b' })

    expect(graph.getNodes()).toContainEqual({ a: 1, b: 'b' })
    expect(graph.getNodes()).toContainEqual({ a: 2, b: 'b' })
    expect(graph.getNodes()).toContainEqual({ a: 3, b: 'b' })
    expect(graph.getNodes()).toContainEqual({ a: 4, b: 'b' })
  })

  it('can return the nodes sorted', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 4, b: 'b' })
    graph.insert({ a: 1, b: 'b' })
    graph.insert({ a: 3, b: 'b' })

    expect(graph.getNodes((a, b) => a.a - b.a)).toEqual([
      { a: 1, b: 'b' },
      { a: 2, b: 'b' },
      { a: 3, b: 'b' },
      { a: 4, b: 'b' }
    ])
  })

  it('can get a specific node', () => {
    type NodeType = { a: number; b: string }
    const identityfn = (n: NodeType) => n.a.toFixed(2)
    const graph = new Graph<NodeType>(identityfn)

    const inputToRetrieve = { a: 1, b: 'c' }

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 4, b: 'b' })
    graph.insert(inputToRetrieve)
    graph.insert({ a: 3, b: 'b' })

    expect(graph.getNode(identityfn(inputToRetrieve))).toBeDefined()
    expect(graph.getNode(identityfn(inputToRetrieve))).toEqual(inputToRetrieve)
    expect(graph.getNode('nonsense')).toBeUndefined()
  })
})
