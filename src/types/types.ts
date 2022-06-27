export type CardType = { term: string, definition: string, pos: string, usage: string, needsRevision: boolean, tags: string[], related: string, dialect: string, memorization: number };
export type PacketType = { language: string, dir: "ltr" | "rtl", cards: CardType[] };