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
 * A `Graph` is is a simple undirected graph.
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
}
