export interface Opening {
  id: number;
  name: string;
  description: string;
  eco?: string; // e.g., "C50"
  moves?: string;
  side: string;
  isActive: boolean;
  variations: OpeningVariation[]; // e.g., "1.e4 e5 2.Nf3 Nc6"
}
