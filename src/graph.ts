import { NodeAlreadyExistsError, NodeDoesntExistError } from "./errors";

/**
 * This is the default [[Graph.constructor | `nodeIdentity`]] function it is simply imported from [object-hash](https://www.npmjs.com/package/object-hash)
 */
const hash = require('object-hash');

/**
 * @internal
 * This type is simply an indicator of whether an edge exists in the adjacency matrix.
 */
export type Edge = 1 | 0;

/**
 * # Graph
 * 
 * A `Graph` is is a simple undirected graph. On it's own it isn't too useful but it forms the basic functionality for the [[`DirectedGraph`]] and [[`DirectedAcyclicGraph`]].
 * 
 * ## Creating a Graph
 * 
 * You can create a graph to contain any type of node, for example:
 * 
 * ```typescript
 * type NodeType = { a: Number, b: string }
 * const graph = new Graph<NodeType>()
 * 
 * // Add a node of the defined type
 * graph.insert({ a: 10, b: 'string' })
 * ```
 * 
 * ### Defining a custom node identity
 *
 * When you create a graph you likely want to create include a custom `nodeIdentity` function. 
 * This function tells the graph how to uniquely identify nodes in a graph, 
 * default is to simply use an [[hash]] which means that functionality like [[`replace`]] will not work.
 *
 * ```typescript
 * type NodeType = { count: number, name: string }
 * const graph = new Graph<NodeType>((n) => n.name)
 *
 * // Add a node
 * graph.insert({ count: 5, name: 'node1' })
 * // This will throw an error even though `count` is different because they share a name.
 * graph.insert({ count: 20, name: 'node1' })
 * ```
 * 
 * ### Adding an edge
 * 
 * Graphs without edges aren't very useful. Inserting edges is done using the node identity string returned by the node identity function.
 * 
 * ```typescript
 * const node1: string = graph.insert({ count: 5, name: 'node1' })
 * const node2: string = graph.insert({ count: 20, name: 'node2' })
 * 
 * graph.addEdge(node1, node2)
 * 
 * // This will throw an error since there is no node with the later name.
 * graph.addEdge(node1, 'not a real node')
 * ```
 * 
 * In an undirected graph the order in which you input the node names doesn't matter,
 * but in directed graphs the "from node" comes first and the "to node" will come second.
 * 
 * ### Replacing a node
 * 
 * If a node already exists you can update it using [[`replace`]]. `nodeIdentity(newNode)` must be equal to `nodeIdentity(oldNode)`.
 * 
 * ```typescript
 * const node1: string = graph.insert({ count: 5, name: 'node1' })
 * const node2: string = graph.insert({ count: 20, name: 'node2' })
 * 
 * // This will work because the name has not changed.
 * graph.replace({ count: 15, name: 'node1' })
 * 
 * // This will not work because the name has changed.
 * graph.replace({ count: 20, name: 'node3' })
 * ```
 * 
 * [[`replace`]] will throw a [[`NodeDoesntExistError`]] exception if you are trying to replace a node that is missing from the graph.
 * 
 * ### Upsert
 * 
 * Often you will want to create a node node if it doesn't exist and update it does. This can be achieved using [[`upsert`]].
 * 
 * ```typescript
 * const node1: string = graph.insert({ count: 5, name: 'node1' })
 *
 * // Both of these will work, the first updating node1 and the second creating a node.
 * const node2: string = graph.upsert({ count: 15, name: 'node1' })
 * const node3: string = graph.upsert({ count: 25, name: 'node3' })
 * ```
 * 
 * [[`upsert`]] always return the node identity string of the inserted or updated node. At presented there is no way to tell if the node was created or updated.
 * 
 * @typeParam T  `T` is the node type of the graph. Nodes can be anything in all the included examples they are simple objects.
 */
export default class Graph<T> {
  protected nodes: Map<string, T>;
  protected adjacency: Array<Array<Edge>>;
  protected nodeIdentity: (t: T) => string;

  constructor(nodeIdentity: (node: T) => string = (node) => hash(node)) {
    this.nodes = new Map();
    this.adjacency = [];
    this.nodeIdentity = nodeIdentity;
  }

  /**
   * Add a node to the graph if it doesn't already exist. If it does, throw a [[`NodeAlreadyExistsError`]].
   * 
   * @param node The node to be added
   * @returns A `string` that is the identity of the newly inserted node. This is created by applying the [[constructor | `nodeIdentity`]].
   */
  insert(node: T): string {
    const isOverwrite = this.nodes.has(this.nodeIdentity(node));

    if (isOverwrite) {
      throw new NodeAlreadyExistsError(node, this.nodes.get(this.nodeIdentity(node)), this.nodeIdentity(node))
    }
    
    this.nodes.set(this.nodeIdentity(node), node)
    this.adjacency.map(adj => adj.push(0))
    this.adjacency.push(new Array(this.adjacency.length + 1))

    return this.nodeIdentity(node);
  }

  /**
   * This replaces an existing node in the graph with an updated version. 
   * Throws a [[`NodeDoesNotExistsError`]] if no node with the same identity already exists. 
   * 
   * __Caveat_:_ The default identity function means that this will never work since if the node changes it will have a different [[`hash`]].
   * 
   * @param node The new node that is replacing the old one.
   */
  replace(node: T) {
    const isOverwrite = this.nodes.has(this.nodeIdentity(node));

    if (!isOverwrite) {
      throw new NodeDoesntExistError(this.nodeIdentity(node));
    }

    this.nodes.set(this.nodeIdentity(node), node)
  }

  /**
   * This essentially combines the behavior of [[`insert`]] and [[`replace`]].
   * If the node doesn't exist, create it. If the node already exists, replace it with the updated version.
   * 
   * @param node The node to insert or update
   * @returns The identity string of the node inserted or updated.
   */
  upsert(node: T): string {
    const isOverwrite = this.nodes.has(this.nodeIdentity(node));

    this.nodes.set(this.nodeIdentity(node), node)

    if (!isOverwrite) {
      this.adjacency.map(adj => adj.push(0))
      this.adjacency.push(new Array(this.adjacency.length + 1))
    }

    return this.nodeIdentity(node);
  }

  /**
   * Create an edge between two nodes in the graph. 
   * Throws a [[`NodeDoesNotExistsError`]] if no either of the nodes you are attempting to connect do not exist.
   * 
   * @param node1Identity The first node to connect (in [[`DirectedGraph`]]s and [[`DirectedAcyclicGraph`]]s this is the `from` node.)
   * @param node2Identity The second node to connect (in [[`DirectedGraph`]]s and [[`DirectedAcyclicGraph`]]s this is the `to` node)
   */
  addEdge(node1Identity: string, node2Identity: string) {
    const node1Exists = this.nodes.has(node1Identity)
    const node2Exists = this.nodes.has(node2Identity)

    if (!node1Exists) {
      throw new NodeDoesntExistError(node1Identity)
    }

    if (!node2Exists) {
      throw new NodeDoesntExistError(node2Identity)
    }

    const node1Index = Array.from(this.nodes.keys()).indexOf(node1Identity);
    const node2Index = Array.from(this.nodes.keys()).indexOf(node2Identity);

    this.adjacency[node1Index][node2Index] = 1
  }

  /**
   * This simply returns all the nodes stored in the graph
   */
  getNodes(): T[] {
    return Array.from(this.nodes.values());
  }
}
