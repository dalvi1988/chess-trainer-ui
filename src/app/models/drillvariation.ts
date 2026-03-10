export interface DrillVariation {
  id: number;
  name: string;
  moves: string[]; // parsed SAN array
  openingId: number;
  openingName: string;
  openingEco?: string;
  openingSide: string;
  openingDescription?: string;
}
