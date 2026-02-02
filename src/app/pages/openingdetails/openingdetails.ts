import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Opening } from '../../models/openings';
import { Chess } from 'chess.js';
import { OpeningsService } from '../../services/openings.service';
import { StockfishService } from '../../services/stockfish-service';
import { Chessground } from 'chessground';

@Component({
  selector: 'app-openingdetails',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './openingdetails.html',
  styleUrl: './openingdetails.css',
})
export class Openingdetails implements AfterViewInit {
  opening: any;
  chess = new Chess();
  board: any;
  hintMove: string | null = null;

  selectedVariation: OpeningVariation | null = null;
  variationMoves: string[] = [];
  currentMoveIndex = 0;
  evalScore = 0;
  shapes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private openingsService: OpeningsService,
    private stockfishService: StockfishService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.openingsService.getById(id).subscribe((data: Opening) => {
      this.opening = data;
      this.chess.reset();

      const side = this.opening.side?.toLowerCase().trim() === 'black' ? 'black' : 'white';

      if (this.board) {
        this.board.set({
          orientation: side,
        });
      }
    });
  }

  ngAfterViewInit() {
    const element = document.getElementById('board');
    if (!element) {
      console.error('Board element not found');
      return;
    }

    this.board = Chessground(element, {
      fen: this.chess.fen(),
      draggable: { enabled: true },
      drawable: {
        enabled: true,
        visible: true,
        brushes: {
          green: {
            key: 'green',
            color: '#15781B',
            opacity: 0.5,
            lineWidth: 10,
          },
          red: {
            key: 'red',
            color: '#882020',
            opacity: 0.5,
            lineWidth: 10,
          },
          blue: {
            key: 'blue',
            color: '#003088',
            opacity: 0.5,
            lineWidth: 10,
          },
          yellow: {
            key: 'yellow',
            color: '#e68f00',
            opacity: 0.5,
            lineWidth: 10,
          },
          correct: {
            key: 'correct',
            color: '#4caf50',
            opacity: 0.5,
            lineWidth: 10,
          },
          wrong: {
            key: 'wrong',
            color: '#f44336',
            opacity: 0.5,
            lineWidth: 10,
          },
        },
        shapes: [],
      },
      events: {
        move: (from: string, to: string) => this.onMove(from, to),
        select: (square: string) => this.onSelect(square), // 🔥 THIS CALLS YOUR METHOD
      },
    });

    this.updateBoard();
  }

  onSelect(square: string) {
    // remove previous blue highlights only
    this.shapes = this.shapes.filter((s) => s.brush !== 'blue');

    // 🔥 FIX 1: cast square to any so TS accepts it
    const moves = this.chess.moves({ square: square as any, verbose: true }) as any[];
    if (!moves.length) {
      this.updateBoard();
      return;
    }

    // 🔥 FIX 2: cast m.to to any so TS accepts it
    const selectionShapes = moves.map((m) => ({
      orig: m.to as any,
      brush: 'blue',
    }));

    this.shapes = [...this.shapes, ...selectionShapes];

    this.updateBoard();
  }

  onVariationSelect(event: any) {
    const id = Number(event.target.value);

    this.selectedVariation =
      this.opening.variations.find((v: OpeningVariation) => v.id === id) || null;
    const side = this.opening.side?.toLowerCase().trim() === 'black' ? 'black' : 'white';

    this.board.set({
      orientation: side,
    });
    if (!this.selectedVariation) return;
    this.shapes = [];

    this.chess.reset();
    this.shapes = [];
    this.board.set({ lastMove: [] });
    this.updateBoard();

    // Clean PGN
    const cleanPgn = this.selectedVariation.moves
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Load full PGN to extract move list
    this.chess.loadPgn(cleanPgn);
    this.variationMoves = this.chess.history();

    // Reset board to start
    this.chess.reset();
    this.currentMoveIndex = 0;

    // ⭐ Flip board based on opening side
    this.board.set({
      orientation: this.opening.side === 'black' ? 'black' : 'white',
    });

    // ⭐ If user plays Black → auto-play White moves
    if (this.opening.side.toLowerCase() === 'black') {
      while (this.currentMoveIndex < this.variationMoves.length) {
        const san = this.variationMoves[this.currentMoveIndex];
        const move = this.chess.move(san);

        if (!move) break;

        // ⭐ Highlight White's auto-played move
        this.shapes = [
          { orig: move.from as any, brush: 'correct' },
          { orig: move.to as any, brush: 'correct' },
        ];

        // ⭐ Play sound for auto-play
        this.playSound(move.flags.includes('c') ? 'capture' : 'move');

        this.currentMoveIndex++;

        // Stop when it's Black's turn
        if (this.chess.turn() === 'b') break;
      }

      // ⭐ Update board AFTER auto-play
      this.updateBoard();
    }
  }

  onMove(from: string, to: string) {
    const beforeFen = this.chess.fen();
    console.log(this.currentMoveIndex);
    let move;
    try {
      move = this.chess.move({ from, to, promotion: 'q' });
    } catch {
      this.chess.load(beforeFen);
      this.playSound('wrong');
      this.updateBoard();
      return;
    }

    if (!move) {
      this.chess.load(beforeFen);
      this.playSound('wrong');
      this.updateBoard();
      return;
    }

    const expected = this.variationMoves[this.currentMoveIndex];

    // ⭐ Correct move
    if (move.san === expected) {
      this.playSound(move.flags.includes('c') ? 'capture' : 'move');

      this.shapes = [
        { orig: from as any, brush: 'correct' },
        { orig: to as any, brush: 'correct' },
      ];

      this.currentMoveIndex++;

      // ⭐ Auto-play opponent move
      if (this.currentMoveIndex < this.variationMoves.length) {
        const replySan = this.variationMoves[this.currentMoveIndex];

        setTimeout(() => {
          const reply = this.chess.move(replySan);

          if (reply) {
            this.playSound(reply.flags.includes('c') ? 'capture' : 'move');

            this.shapes = [
              { orig: reply.from as any, brush: 'correct' },
              { orig: reply.to as any, brush: 'correct' },
            ];
          }

          this.currentMoveIndex++;

          this.updateBoard();
          // ⭐ If no opponent move and variation is finished
        }, 600);
      }

      this.updateBoard();
      // ⭐ If no opponent move and variation is finished
      if (this.currentMoveIndex >= this.variationMoves.length) {
        setTimeout(() => {
          alert('Great job! You completed the variation.');
        }, 200);
      }

      return;
    }

    // ❌ Wrong move
    this.playSound('wrong');

    this.shapes = [
      { orig: from as any, brush: 'wrong' },
      { orig: to as any, brush: 'wrong' },
    ];

    this.chess.load(beforeFen);
    this.updateBoard();
  }

  showHint() {
    // no more moves left
    if (this.currentMoveIndex >= this.variationMoves.length) return;

    const san = this.variationMoves[this.currentMoveIndex];

    // convert SAN → move object without modifying board
    const moves = this.chess.moves({ verbose: true });
    const hintMove = moves.find((m) => m.san === san);

    if (!hintMove) return;

    // remove old hint shapes only
    this.shapes = this.shapes.filter((s) => s.brush !== 'yellow');

    // add hint highlight
    this.shapes.push(
      { orig: hintMove.from as any, brush: 'yellow' },
      { orig: hintMove.to as any, brush: 'yellow' },
    );

    this.updateBoard();
  }
  validateMove(userMove: string): boolean {
    const expected = this.variationMoves[this.currentMoveIndex];

    if (userMove === expected) {
      this.currentMoveIndex++;

      if (this.currentMoveIndex < this.variationMoves.length) {
        const nextMove = this.variationMoves[this.currentMoveIndex];
        this.chess.move(nextMove);
        this.currentMoveIndex++;
      }

      this.updateBoard();
      return true;
    }

    return false;
  }
  playSound(type: 'move' | 'capture' | 'wrong' | 'check') {
    const audio = new Audio(`assets/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play();
  }
  private updateBoard() {
    this.board.set({
      fen: this.chess.fen(),
      drawable: {
        enabled: true,
        visible: true,
        brushes: this.board.state.drawable.brushes, // keep your brushes
        shapes: this.shapes, // overwrite shapes properly
      },
    });
  }
}
