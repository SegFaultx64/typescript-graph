import DirectedGraph from "./directedGraph";
import { CycleError } from "./errors";

/**
 * # DirectedAcyclicGraph
 *
 * A DirectedAcyclicGraph is builds on a [[`DirectedGraph`]] but enforces acyclicality. You cannot add an edge to a DirectedAcyclicGraph that would create a cycle.
 *
 * @typeParam T `T` is the node type of the graph. Nodes can be anything in all the included examples they are simple objects.
 */
export default class DirectedAcyclicGraph<T> extends DirectedGraph<T> {
    private _topologicallySortedNodes?: Array<T>;
    protected hasCycle = false; 

    /**
     * Converts an existing directed graph into a directed acyclic graph.
     * Throws a {@linkcode CycleError} if the graph attempting to be converted contains a cycle.
     * @param graph The source directed graph to convert into a DAG
     */
    static fromDirectedGraph<T>(graph: DirectedGraph<T>): DirectedAcyclicGraph<T> {
        if (!graph.isAcyclic()) {
            throw new CycleError("Can't convert that graph to a DAG because it contains a cycle")
        }
        const toRet = new DirectedAcyclicGraph<T>();

        toRet.nodes = (graph as any).nodes
        toRet.adjacency = (graph as any).adjacency

        return toRet;
    }

    /**
     * Adds an edge to the graph similarly to [[`DirectedGraph.addEdge`]] but maintains correctness of the acyclic graph.
     * Thows a [[`CycleError`]] if adding the requested edge would create a cycle. 
     * Adding an edge invalidates the cache of topologically sorted nodes, rather than updating it.
     * 
     * @param fromNodeIdentity The identity string of the node the edge should run from.
     * @param toNodeIdentity The identity string of the node the edge should run to.
     */
    addEdge(fromNodeIdentity: string, toNodeIdentity: string) {
        if (this.wouldAddingEdgeCreateCyle(fromNodeIdentity, toNodeIdentity)) {
            throw new CycleError(`Can't add edge from ${fromNodeIdentity} to ${toNodeIdentity} it would create a cycle`)
        }

        // Invalidate cache of toposorted nodes
        this._topologicallySortedNodes = undefined;
        super.addEdge(fromNodeIdentity, toNodeIdentity, true)
    }

    /**
     * Inserts a node into the graph and maintains topologic sort cache by prepending the node
     * (since all newly created nodes have an [[ indegreeOfNode | indegree ]] of zero.)
     * 
     * @param node The node to insert
     */
    insert(node: T): string {
        if (this._topologicallySortedNodes) {
            this._topologicallySortedNodes = [node, ...this._topologicallySortedNodes];
        }
        
        return super.insert(node)
    }

    /**
     * Topologically sort the nodes using Kahn's algorithim. Uses a cache which means that repeated calls should be O(1) after the first call. 
     * Non-cached calls are potentially expensive, Kahn's algorithim is O(|EdgeCount| + |NodeCount|). 
     * There may be more than one valid topological sort order for a single graph, 
     * so just because two graphs are the same does not mean that order of the resultant arrays will be.
     * 
     * @returns An array of nodes sorted by the topological order.
     */
    topologicallySortedNodes(): Array<T> {
        if (this._topologicallySortedNodes !== undefined) {
            return this._topologicallySortedNodes;
        }

        const nodeIndices = Array.from(this.nodes.keys());
        const nodeInDegrees = new Map(Array.from(this.nodes.keys()).map(n => [n, this.indegreeOfNode(n)]))

        const adjCopy = this.adjacency.map(a => [...a])

        let toSearch = Array.from(nodeInDegrees).filter(pair => pair[1] === 0)

        if (toSearch.length === this.nodes.size) {
            const arrayOfNodes = Array.from(this.nodes.values());
            this._topologicallySortedNodes = arrayOfNodes
            return arrayOfNodes
        }

        let toReturn: Array<T> = []

        while (toSearch.length) {
            const n = (toSearch.pop() as [string, number]);
            const curNode = (this.nodes.get(n[0]) as T);
            toReturn.push(curNode);

            (adjCopy[nodeIndices.indexOf(n[0])])?.forEach((edge, index) => {
                if (edge > 0) {
                    adjCopy[nodeIndices.indexOf(n[0])][index] = 0;
                    const target = (nodeInDegrees.get(nodeIndices[index]) as number);
                    nodeInDegrees.set(nodeIndices[index], target - 1)

                    if ((target - 1) === 0) {
                        toSearch.push([nodeIndices[index], 0])    
                    }
                }
            })
        }

        // Update cache
        this._topologicallySortedNodes = toReturn;

        // we shouldn't need to account for the error case of there being a cycle because it shouldn't
        // be possible to instantiate this class in a state (or put it in a state) where there is a cycle.

        return toReturn
    }

    /**
     * Given a starting node this returns a new [[`DirectedA`]] containing all the nodes that can be reached. 
     * Throws a [[`NodeDoesntExistError`]] if the start node does not exist.
     * 
     * @param startNodeIdentity The string identity of the node from which the subgraph search should start.
     */
    getSubGraphStartingFrom(startNodeIdentity: string): DirectedAcyclicGraph<T> {
        return DirectedAcyclicGraph.fromDirectedGraph(super.getSubGraphStartingFrom(startNodeIdentity));
    }
}
