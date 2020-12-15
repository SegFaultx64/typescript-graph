var hash = require('object-hash');

export type Direction = 1 | 0 | -1;
export class NodeAlreadyExistsError<T> extends Error {
  public newNode: T;
  public oldNode: T;
  public identity: string;

  constructor(newNode: T, oldNode: T, identity: string) {
    super(`${JSON.stringify(newNode)} shares an identity (${identity}) with ${ JSON.stringify(oldNode) }`);
    this.newNode = newNode;
    this.oldNode = oldNode;
    this.identity = identity;
    this.name = "NodeAlreadyExistsError";

    // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, NodeAlreadyExistsError.prototype);
  }
}
export class NodeDoesntExistError<T> extends Error {
  public identity: string;

  constructor(identity: string) {
    super(`A node with identity ${identity} doesn't exist in the graph`);
    this.identity = identity;
    this.name = "NodeDoesntExistError";

    // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, NodeDoesntExistError.prototype);
  }
}

export default class Graph<T> {
  protected nodes: Map<string, T>;
  protected adjacency: Array<Array<Direction>>;
  protected nodeIdentity: (t: T) => string;

  constructor(nodeIdentity: (node: T) => string = (node) => hash(node)) {
    this.nodes = new Map();
    this.adjacency = [];
    this.nodeIdentity = nodeIdentity;
  }

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

  replace(node: T) {
    const isOverwrite = this.nodes.has(this.nodeIdentity(node));

    if (!isOverwrite) {
      throw new NodeDoesntExistError(this.nodeIdentity(node));
    }

    this.nodes.set(this.nodeIdentity(node), node)
  }

  upsert(node: T): string {
    const isOverwrite = this.nodes.has(this.nodeIdentity(node));

    this.nodes.set(this.nodeIdentity(node), node)

    if (!isOverwrite) {
      this.adjacency.map(adj => adj.push(0))
      this.adjacency.push(new Array(this.adjacency.length + 1))
    }

    return this.nodeIdentity(node);
  }

  addEdge(node1Identity: string, node2Identity: string) {
    const node1Exists = this.nodes.has(node1Identity)
    const node2Exists = this.nodes.has(node2Identity)

    if (!node1Exists)
      throw new NodeDoesntExistError(node1Identity)

    if (!node2Exists)
      throw new NodeDoesntExistError(node2Identity)

    const node1Index = Array.from(this.nodes.keys()).indexOf(node1Identity);
    const node2Index = Array.from(this.nodes.keys()).indexOf(node2Identity);

    this.adjacency[node1Index][node2Index] = 1

    if (this.adjacency[node2Index][node1Index] === undefined || this.adjacency[node2Index][node1Index] < 1)
      this.adjacency[node2Index][node1Index] = -1
  }
}
