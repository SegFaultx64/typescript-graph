import { NodeDoesntExistError } from "./errors";
import Graph from "./typescript-graph";

export default class DirectedGraph<T> extends Graph<T> {
    /** Caches if the graph contains a cycle. If `undefined` then it is unknown. */
    protected hasCycle?: boolean;

    /**
     * Returns `true` if there are no cycles in the graph. 
     * This relies on a cached value so calling it multiple times without adding edges to the graph should be O(1) after the first call.
     * Non-cached calls are potentially expensive, the implementation is based on Kahn's algorithim which is O(|EdgeCount| + |NodeCount|).
     */
    isAcyclic(): boolean {
        if (this.hasCycle !== undefined) {
            return !this.hasCycle
        }

        const nodeIndices = Array.from(this.nodes.keys());
        const nodeInDegrees = new Map(Array.from(this.nodes.keys()).map(n => [n, this.indegreeOfNode(n)]))

        let toSearch = Array.from(nodeInDegrees).filter(pair => pair[1] === 0)

        let visitedNodes = 0;
        
        while (toSearch.length > 0) {
            const cur = toSearch.pop();
            if (!cur) {
                continue;
            }

            const nodeIndex = nodeIndices.indexOf(cur[0]);
            this.adjacency[nodeIndex].forEach((hasAdj, index) => {
                if (hasAdj === 1) {
                    const currentInDegree = nodeInDegrees.get(nodeIndices[index]);
                    if (currentInDegree !== undefined) {
                        nodeInDegrees.set(nodeIndices[index], currentInDegree - 1)
                        if ((currentInDegree - 1) === 0) {
                            toSearch.push([nodeIndices[index], currentInDegree - 1])
                        }
                    }
                }
            })

            visitedNodes++;
        }

        this.hasCycle = !(visitedNodes === this.nodes.size)

        return visitedNodes === this.nodes.size;
    }

    /**
     * The indegree of a node is the number of edges that point to it. This will always be an integer.
     * 
     * Throws a [[`NodeDoesntExistError`]] the node does not exist.
     * 
     * @param nodeID The string of the node identity of the node to calculate indegree for.
     */
    indegreeOfNode(nodeID: string): number {
        const nodeIdentities = Array.from(this.nodes.keys());
        const indexOfNode = nodeIdentities.indexOf(nodeID);

        if (indexOfNode === -1) {
            throw new NodeDoesntExistError(nodeID);
        }

        return this.adjacency.reduce<number>((carry, row) => {
            return carry + ((row[indexOfNode] > 0)? 1 : 0);
        }, 0)
    }

    /**
     * Add a directed edge to the graph.
     * 
     * @param fromNodeIdentity The identity string of the node the edge should run from. 
     * @param toNodeIdentity The identity string of the node the edge should run to.
     * @param skipUpdatingCyclicality This boolean indicates if the cache of the cyclicality of the graph should be updated.
     * If `false` is passed the cached will be invalidated because we can not assure that a cycle has not been created.
     */
    addEdge(fromNodeIdentity: string, toNodeIdentity: string, skipUpdatingCyclicality: boolean = false) {
        if (!this.hasCycle && !skipUpdatingCyclicality) {
            this.hasCycle = this.wouldAddingEdgeCreateCyle(fromNodeIdentity, toNodeIdentity);
        } else if (skipUpdatingCyclicality) {
            this.hasCycle = undefined;
        }

        super.addEdge(fromNodeIdentity, toNodeIdentity)
    }

    /**
     * Depth first search to see if one node is reachable from another following the directed edges.
     * 
     * __Caveat:__ This will return false if `startNode` and `endNode` are the same node and the is not a cycle or a loop edge connecting them.
     * 
     * @param startNode The string identity of the node to start at. 
     * @param endNode The string identity of the node we are attempting to reach.
     */
    canReachFrom(startNode: string, endNode: string): boolean {
        const nodeIdentities = Array.from(this.nodes.keys());
        const startNodeIndex = nodeIdentities.indexOf(startNode);
        const endNodeIndex = nodeIdentities.indexOf(endNode);

        if (this.adjacency[startNodeIndex][endNodeIndex] > 0) {
            return true
        }

        return this.adjacency[startNodeIndex].reduce<boolean>((carry, edge, index) => {
            if (carry || (edge < 1)) {
                return carry;
            }

            return this.canReachFrom(nodeIdentities[index], endNode)
        }, false)
    }

    /**
     * Checks if adding the specified edge would create a cycle.
     * Returns true in O(1) if the graph already contains a known cycle, or if `fromNodeIdentity` and `toNodeIdentity` are the same.
     * 
     * @param fromNodeIdentity The string identity of the node the edge is from.
     * @param toNodeIdentity The string identity of the node the edge is to.
     */
    wouldAddingEdgeCreateCyle(fromNodeIdentity: string, toNodeIdentity: string): boolean {
        return this.hasCycle || fromNodeIdentity === toNodeIdentity || this.canReachFrom(toNodeIdentity, fromNodeIdentity);
    }
}