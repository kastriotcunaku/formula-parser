export interface Block {
    type: string,
    expression?: Block,
    arguments?: Block[],
    left?: Block,
    right?: Block,
    name?: string,
    value?: string
}