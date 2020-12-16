import DirectedGraph from "./directedGraph";

export class CycleError<T> extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CycleError";

        // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
        Object.setPrototypeOf(this, CycleError.prototype);
    }
}
export default class DirectedAcyclicGraph<T> extends DirectedGraph<T> {
    static fromDirectedGraph<T>(graph: DirectedGraph<T>): DirectedAcyclicGraph<T> {
        if (!graph.isAcyclic()) {
            throw new CycleError("Can't convert that graph to a DAG because it contains a cycle")
        }
        const toRet = new DirectedAcyclicGraph<T>();

        toRet.nodes = (graph as any).nodes
        toRet.adjacency = (graph as any).adjacency

        return toRet;
    }


    addEdge(node1Identity: string, node2Identity: string) {
        if (this.wouldAddingEdgeCreateCyle(node1Identity, node2Identity)) {
            throw new CycleError(`Can't add edge from ${node1Identity} to ${node2Identity} it would create a cycle`)
        }
        super.addEdge(node1Identity, node2Identity)
    }

    // This is an implementation of Kahn's algorithim
    topologicallySortedNodes(): Array<T> {
        const nodeIndices = Array.from(this.nodes.keys());
        const nodeInDegrees = new Map(Array.from(this.nodes.keys()).map(n => [n, this.inDegreeOfNode(n)]))

        const adjCopy = this.adjacency.map(a => [...a])

        let toSearch = Array.from(nodeInDegrees).filter(pair => pair[1] === 0)

        if (toSearch.length === this.nodes.size) {
            return Array.from(this.nodes.values())
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

        // we shouldn't need to account for the error case of there being a cycle because it shouldn't
        // be possible to instantiate this class in a state (or put it in a state) where there is a cycle.

        return toReturn
    }
}
