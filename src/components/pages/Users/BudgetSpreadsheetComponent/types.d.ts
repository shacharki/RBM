
declare type PreRenderComputation = { [cell: string]: {
    outputCell: string // The cell to put the output of the computation in.
    func: {
        funcName: string,
        args: Array<string>
    }
}}