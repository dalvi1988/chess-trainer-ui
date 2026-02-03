import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Opening } from '../../models/openings';
import { Chess } from 'chess.js';
import { OpeningsService } from '../../services/openings.service';
import { StockfishService } from '../../services/stockfish-service';
import { Chessground } from 'chessground';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VariationCompleteDialog } from '../variation-complete-dialog/variation-complete-dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-openingdetails',
  standalone: true,
  imports: [FormsModule, MatCardModule],
  templateUrl: './openingdetails.html',
  styleUrl: './openingdetails.css',
})
export class Openingdetails implements AfterViewInit, OnInit, OnDestroy {
  opening!: Opening;
  chess = new Chess();
  board: any;

  selectedVariation: OpeningVariation | null = null;
  variationMoves: string[] = [];
  currentMoveIndex = 0;
  variationCompleted = false;
  showCompletionPanel = false;
  selectedVariationId: number | null = null;

  shapes: any[] = [];
  private openingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private openingsService: OpeningsService,
    private stockfishService: StockfishService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    const openingName = String(this.route.snapshot.paramMap.get('name'));

    this.openingSub = this.openingsService.getByName(openingName).subscribe((data: Opening) => {
      this.opening = data;

      if (this.opening.variations?.length > 0) {
        const first = this.opening.variations[0];

        this.selectedVariation = first;
        this.selectedVariationId = first.id; // ⭐ dropdown updates

        this.onVariationSelect({ target: { value: first.id } });
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
        select: (square: string) => this.onSelect(square),
      },
    });

    this.updateBoard();
  }

  ngOnDestroy() {
    this.openingSub?.unsubscribe();
  }

  // ---------- helpers ----------

  private normalizeSan(san: string): string {
    return san.replace(/[+#?!]/g, '').trim();
  }

  private clearShapes(brush: string) {
    this.shapes = this.shapes.filter((s) => s.brush !== brush);
  }

  private highlightPair(from: string, to: string, brush: string) {
    this.shapes.push({ orig: from as any, brush }, { orig: to as any, brush });
  }

  private updateBoard() {
    if (!this.board) return;
    this.board.set({
      fen: this.chess.fen(),
      drawable: {
        ...this.board.state.drawable,
        shapes: [...this.shapes],
      },
    });
  }

  private autoPlayNextMove(delayMs = 600) {
    if (this.currentMoveIndex >= this.variationMoves.length) return;

    const san = this.variationMoves[this.currentMoveIndex];

    setTimeout(() => {
      const beforeFen = this.chess.fen();
      const reply = this.chess.move(san);

      if (!reply) {
        this.chess.load(beforeFen);
        return;
      }

      this.playSound(reply.flags.includes('c') ? 'capture' : 'move');
      this.clearShapes('correct');
      this.highlightPair(reply.from as any, reply.to as any, 'correct');

      this.currentMoveIndex++;
      this.updateBoard();
    }, delayMs);
  }

  // ---------- UI actions ----------

  onSelect(square: string) {
    this.clearShapes('blue');

    const moves = this.chess.moves({ square: square as any, verbose: true }) as any[];

    if (!moves.length) {
      this.updateBoard();
      return;
    }

    // highlight selected square
    this.shapes.push({ orig: square as any, brush: 'blue' });

    // highlight legal destinations
    moves.forEach((m) => {
      this.shapes.push({ orig: m.to as any, brush: 'blue' });
    });

    this.updateBoard();
  }

  onVariationSelect(event: any) {
    const id = Number(event.target.value);
    this.selectedVariation =
      this.opening.variations.find((v: OpeningVariation) => v.id === id) || null;

    if (!this.selectedVariation) return;

    const side = this.opening.side?.toLowerCase().trim() === 'black' ? 'black' : 'white';

    this.board.set({ orientation: side, lastMove: [] });

    this.chess.reset();
    this.shapes = [];
    this.updateBoard();

    const cleanPgn = this.selectedVariation.moves
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    this.chess.loadPgn(cleanPgn);
    this.variationMoves = this.chess.history();
    this.chess.reset();
    this.currentMoveIndex = 0;

    this.board.set({ orientation: side });

    // if user plays Black, auto-play White's first moves
    if (side === 'black') {
      while (this.currentMoveIndex < this.variationMoves.length) {
        const san = this.variationMoves[this.currentMoveIndex];
        const move = this.chess.move(san);
        if (!move) break;

        this.playSound(move.flags.includes('c') ? 'capture' : 'move');
        this.clearShapes('correct');
        this.highlightPair(move.from as any, move.to as any, 'correct');

        this.currentMoveIndex++;
        if (this.chess.turn() === 'b') break;
      }
      this.updateBoard();
    }
  }

  onMove(from: string, to: string) {
    const beforeFen = this.chess.fen();

    // Detect "select another own piece" instead of a real move
    const fromPiece = this.chess.get(from as any);
    const toPiece = this.chess.get(to as any);

    if (fromPiece && toPiece && fromPiece.color === toPiece.color) {
      // Just change selection, no wrong sound, no move
      this.chess.load(beforeFen); // ensure position unchanged
      this.onSelect(to); // reuse your selection logic
      return;
    }

    let move;

    // Try to make the move
    try {
      move = this.chess.move({ from, to, promotion: 'q' });
    } catch {
      // Illegal move → revert
      this.chess.load(beforeFen);
      this.playSound('wrong');
      this.updateBoard();
      return;
    }

    // Illegal move (null)
    if (!move) {
      this.chess.load(beforeFen);
      this.playSound('wrong');
      this.updateBoard();
      return;
    }

    // Get expected move from variation
    const expected = this.variationMoves[this.currentMoveIndex];

    // ⭐ Correct move
    if (this.normalizeSan(move.san) === this.normalizeSan(expected)) {
      this.playSound(move.flags.includes('c') ? 'capture' : 'move');

      // Highlight correct move
      this.clearShapes('wrong');
      this.clearShapes('correct');
      this.highlightPair(from, to, 'correct');

      this.currentMoveIndex++;

      // ⭐ Auto-play opponent move
      if (this.currentMoveIndex < this.variationMoves.length) {
        this.autoPlayNextMove();
      }

      this.updateBoard();

      if (this.currentMoveIndex >= this.variationMoves.length) {
        this.openCompletionDialog();
      }

      return;
    }

    // ❌ Wrong move
    this.playSound('wrong');
    this.clearShapes('correct');
    this.clearShapes('wrong');
    this.highlightPair(from, to, 'wrong');

    // Revert position
    this.chess.load(beforeFen);
    this.updateBoard();
  }

  showHint() {
    if (this.currentMoveIndex >= this.variationMoves.length) return;

    const san = this.variationMoves[this.currentMoveIndex];
    const moves = this.chess.moves({ verbose: true }) as any[];
    const hintMove = moves.find((m) => this.normalizeSan(m.san) === this.normalizeSan(san));

    if (!hintMove) return;

    this.clearShapes('yellow');
    this.highlightPair(hintMove.from as any, hintMove.to as any, 'yellow');
    this.updateBoard();
  }

  playSound(type: 'move' | 'capture' | 'wrong' | 'check') {
    const audio = new Audio(`assets/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play();
  }
  loadNextVariation() {
    this.showCompletionPanel = false;
    this.variationCompleted = false;

    const variations = this.opening.variations;
    const currentIndex = variations.findIndex((v) => v.id === this.selectedVariation?.id);

    if (currentIndex >= 0 && currentIndex < variations.length - 1) {
      const next = variations[currentIndex + 1];

      this.selectedVariation = next;
      this.selectedVariationId = next.id; // ⭐ updates dropdown

      this.onVariationSelect({ target: { value: next.id } });
    }
  }

  cancelVariation() {
    this.showCompletionPanel = false;
    this.variationCompleted = false;

    // User wants to explore freely — reset board
    this.chess.reset();
    this.shapes = [];
    this.updateBoard();

    // Optional: clear selected variation
    // this.selectedVariation = null;
  }
  openCompletionDialog() {
    const dialogRef = this.dialog.open(VariationCompleteDialog, {
      width: '360px',
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'next') {
        this.loadNextVariation();
      } else {
        this.cancelVariation();
      }
    });
  }
}
