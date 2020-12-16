import Graph, { NodeDoesntExistError } from "./typescript-graph";

export default class DirectedGraph<T> extends Graph<T> {
    private hasCycle?: boolean;

    isAcyclic(): boolean {
        if (this.hasCycle !== undefined) {
            return !this.hasCycle
        }

        const nodeIndices = Array.from(this.nodes.keys());
        const nodeInDegrees = new Map(Array.from(this.nodes.keys()).map(n => [n, this.inDegreeOfNode(n)]))

        let toSearch = Array.from(nodeInDegrees).filter(pair => pair[1] === 0)

        let visitedNodes = 0;

        if (toSearch.length === 0)
            return false
        
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

    inDegreeOfNode(nodeID: string): number {
        const nodeIdentities = Array.from(this.nodes.keys());
        const indexOfNode = nodeIdentities.indexOf(nodeID);

        if (indexOfNode === -1) {
            throw new NodeDoesntExistError(nodeID);
        }

        return this.adjacency.reduce<number>((carry, row) => {
            return carry + ((row[indexOfNode] > 0)? 1 : 0);
        }, 0)
    }

    addEdge(node1Identity: string, node2Identity: string) {
        if (!this.hasCycle) {
            this.hasCycle = undefined;
        }
        super.addEdge(node1Identity, node2Identity)
    }
}