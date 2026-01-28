import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StockfishService {
  private engine: Worker | null = null;
  private callback: ((score: number) => void) | null = null;

  constructor() {
    this.engine = new Worker('assets/stockfish-17.1-lite-single-03e3232.js');

    this.engine.onmessage = (event) => {
      const line = event.data;

      if (typeof line === 'string' && line.includes('cp')) {
        const cp = parseInt(line.split('cp ')[1]);
        if (this.callback) this.callback(cp / 100);
      }

      if (typeof line === 'string' && line.includes('mate')) {
        const mate = parseInt(line.split('mate ')[1]);
        if (this.callback) this.callback(mate > 0 ? 100 : -100);
      }
    };
  }

  evaluatePosition(fen: string, callback: (score: number) => void) {
    this.callback = callback;
    this.engine?.postMessage('position fen ' + fen);
    this.engine?.postMessage('go depth 12');
  }
}
