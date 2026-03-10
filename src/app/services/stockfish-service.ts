import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StockfishService {
  private engine: Worker | null = null;
  private evalCallback: ((score: number) => void) | null = null;

  private pendingResolvers = new Map<string, (fen: string) => void>();

  constructor() {
    this.engine = new Worker('/assets/stockfish/stockfish.worker.js', {
      type: 'classic',
    });
    this.engine.onmessage = (event) => {
      const line = event.data;

      // --- Evaluation handling (your existing logic) ---
      if (typeof line === 'string' && line.includes('cp')) {
        const cp = parseInt(line.split('cp ')[1]);
        if (this.evalCallback) this.evalCallback(cp / 100);
      }

      if (typeof line === 'string' && line.includes('mate')) {
        const mate = parseInt(line.split('mate ')[1]);
        if (this.evalCallback) this.evalCallback(mate > 0 ? 100 : -100);
      }

      // --- Move validation handling ---
      if (typeof line === 'string' && line.startsWith('Fen:')) {
        const fen = line.replace('Fen: ', '').trim();

        // Resolve the oldest pending validation request
        const firstKey = this.pendingResolvers.keys().next().value;
        if (firstKey) {
          const resolve = this.pendingResolvers.get(firstKey);
          if (resolve) resolve(fen);
          this.pendingResolvers.delete(firstKey);
        }
      }
    };
  }

  // -------------------------------
  // POSITION EVALUATION (existing)
  // -------------------------------
  evaluatePosition(fen: string, callback: (score: number) => void) {
    this.evalCallback = callback;
    this.engine?.postMessage('position fen ' + fen);
    this.engine?.postMessage('go depth 12');
  }

  // -------------------------------
  // MOVE VALIDATION (new)
  // -------------------------------
  validateMove(fen: string, move: string): Promise<boolean> {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(2);

      // Store resolver
      this.pendingResolvers.set(id, (newFen: string) => {
        resolve(newFen !== fen); // FEN changed → move was legal
      });

      // Ask Stockfish to apply the move
      this.engine?.postMessage(`position fen ${fen} moves ${move}`);
      this.engine?.postMessage('d'); // prints FEN
    });
  }
}
