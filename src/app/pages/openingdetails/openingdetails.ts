import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Opening } from '../../models/openings';
import { Chess } from 'chess.js';
import { OpeningsService } from '../../services/openings.service';
import { SublineDropdownComponent } from '../../customcomponent/subline-dropdown/subline-dropdown';
import { Chessground } from 'chessground';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VariationCompleteDialog } from '../variation-complete-dialog/variation-complete-dialog';
import { FormsModule } from '@angular/forms';
import { PromotionDialogComponent } from '../promotion-dialog/promotion-dialog';
import { EvaluationBarComponent } from '../evaluation-bar/evaluation-bar';
import { Meta, Title } from '@angular/platform-browser';
import { LoginPromptDialogComponent } from '../login-prompt-dialog/login-prompt-dialog';
import { UserProgressService } from '../../services/user-progress-service';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { StockfishService } from '../../services/stockfish-service';

@Component({
  selector: 'app-openingdetails',
  standalone: true,
  imports: [FormsModule, MatCardModule, EvaluationBarComponent, SublineDropdownComponent],
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
  evalCp: number | null = null;
  evalMate: number | null = null;
  orientation: 'white' | 'black' = 'white';
  shapes: any[] = [];
  private openingSub?: Subscription;
  stockfish!: Worker;
  evalPercent = 50; // 0 = black winning, 100 = white winning
  evalDisplay = '0.0'; // text shown in the middle
  boardReady = false;
  completedVariationIds: number[] = [];
  evalScore: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private openingsService: OpeningsService,
    private dialog: MatDialog,
    private meta: Meta,
    private title: Title,
    private userProgressService: UserProgressService,
    private router: Router,
    private loginService: LoginService,
    private stockfishService: StockfishService,
  ) {}

  ngOnInit() {
    const openingName = String(this.route.snapshot.paramMap.get('name'));

    this.openingSub = this.openingsService.getByName(openingName).subscribe((data: Opening) => {
      this.opening = data;
      const currentUser = this.loginService.getCurrentUser();

      if (currentUser) {
        // Logged-in → save first, then show dialog
        this.userProgressService.getCompletedVariationIds().subscribe((ids) => {
          this.completedVariationIds = ids;
          console.log('completdID' + this.completedVariationIds);
        });
      }
      this.orientation = this.opening.side?.toLowerCase().trim() === 'black' ? 'black' : 'white';

      // ⭐⭐⭐ SEO: Dynamic Title + Meta Description
      this.title.setTitle(`${this.opening.name} – Chess Opening Guide`);
      this.meta.updateTag({
        name: 'description',
        content: `${this.opening.name} explained with moves, ideas, traps, and variations. Learn how to play and counter this opening with interactive training.`,
      });
      this.meta.updateTag({
        name: 'keywords',
        content: `${this.opening.name}, chess opening, ${this.opening.side} openings, chess theory, ${this.opening.eco}`,
      });

      // ⭐ Optional: Structured Data (helps Bing/Google understand the page)
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: this.opening.name,
        description: this.opening.description,
        author: 'ChessLearningHub',
        url: `https://chesslearninghub.com/openings/${this.opening.name}`,
        keywords: `${this.opening.name}, chess opening, ${this.opening.eco}`,
      };
      this.meta.updateTag({
        name: 'schema',
        content: JSON.stringify(schema),
      });

      // ⭐ Variation selection logic (unchanged)
      if (this.opening.variations?.length > 0) {
        const first = this.opening.variations[0];
        this.selectedVariation = first;
        this.selectedVariationId = first.id;
        this.onVariationSelect(first);
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

      movable: {
        free: true, // allow free dragging
        color: 'both', // both sides can move
        events: {
          after: (from: string, to: string) => this.onMove(from, to),
        },
      },

      events: {
        select: (square: string) => this.onSelect(square),
      },

      drawable: {
        enabled: true,
        visible: true,
        brushes: {
          green: { key: 'green', color: '#15781B', opacity: 0.5, lineWidth: 10 },
          red: { key: 'red', color: '#882020', opacity: 0.5, lineWidth: 10 },
          blue: { key: 'blue', color: '#003088', opacity: 0.5, lineWidth: 10 },
          yellow: { key: 'yellow', color: '#e68f00', opacity: 0.5, lineWidth: 10 },
          correct: { key: 'correct', color: '#4caf50', opacity: 0.5, lineWidth: 10 },
          wrong: { key: 'wrong', color: '#f44336', opacity: 0.5, lineWidth: 10 },
        },
        shapes: [],
      },

      highlight: {
        lastMove: true,
        check: true,
      },

      animation: {
        enabled: true,
      },
    });

    this.updateBoard();
    this.boardReady = true;
  }

  ngOnDestroy() {
    this.openingSub?.unsubscribe();
  }

  // ---------- helpers ----------

  private normalizeSan(san: string): string {
    if (!san) return san;

    // ❗ Do NOT remove promotion piece
    // Remove check/mate only
    san = san.replace(/[+#]/g, '');

    // Remove capture symbol
    san = san.replace(/x/g, '');

    // Remove disambiguation (but keep promotion)
    san = san.replace(/^[KQRBN]?[a-h]?[1-8]?/, '');

    return san.trim();
  }

  private clearShapes(brush: string) {
    this.shapes = this.shapes.filter((s) => s.brush !== brush);
  }

  private highlightPair(from: string, to: string, brush: string) {
    this.shapes.push({ orig: from as any, brush }, { orig: to as any, brush });
  }
  private evalTimeout: any;

  private updateBoard() {
    if (!this.board) return;
    this.board.set({
      fen: this.chess.fen(),
      drawable: {
        ...this.board.state.drawable,
        shapes: [...this.shapes],
      },
    });
    // Ask Stockfish to evaluate only after MY move
    const sideToMove = this.chess.turn(); // 'w' or 'b'
    console.log(
      'Side to move:',
      sideToMove,
      'Opening side:',
      this.opening.side?.toLowerCase().trim().charAt(0),
    );
    if (sideToMove === this.opening.side?.toLowerCase().trim().charAt(0)) {
      clearTimeout(this.evalTimeout);
      this.evalTimeout = setTimeout(() => {
        console.log('Evaluating FEN:: ' + sideToMove, this.chess.fen());
        this.evaluatePosition(this.chess.fen());
      }, 150);
    } else {
      console.log('No more moves to eval, skipping Stockfish call.');
    }
  }
  evaluatePosition(fen: string) {
    this.stockfishService.evaluatePosition(fen, (score) => {
      // Mate detection (your service uses ±100)
      if (Math.abs(score) === 100) {
        this.evalMate = score > 0 ? 1 : -1; // M1 or M-1 style
        this.evalCp = null;
      } else {
        this.evalMate = null;
        this.evalCp = Math.round(score * 100); // convert back to centipawns
      }
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

  onVariationSelect(line: any) {
    if (!this.boardReady) {
      // Delay execution until board is ready
      setTimeout(() => this.onVariationSelect(line), 0);
      return;
    }

    this.selectedVariation = line;
    this.selectedVariationId = line.id;

    this.chess.reset();

    if (!this.selectedVariation) return;

    const side = this.opening.side?.toLowerCase().trim() === 'black' ? 'black' : 'white';
    this.orientation = side;

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

    // Selecting another own piece
    const fromPiece = this.chess.get(from as any);
    const toPiece = this.chess.get(to as any);

    if (fromPiece && toPiece && fromPiece.color === toPiece.color) {
      this.chess.load(beforeFen);
      this.onSelect(to);
      return;
    }

    // ⭐ Promotion move
    if (this.isPromotionMove(from, to)) {
      const dialogRef = this.dialog.open(PromotionDialogComponent, {
        width: '300px',
      });

      dialogRef.afterClosed().subscribe((piece: string) => {
        if (!piece) {
          this.chess.load(beforeFen);
          this.updateBoard();
          return;
        }

        const move = this.chess.move({
          from,
          to,
          promotion: piece,
        });

        if (!move) {
          this.chess.load(beforeFen);
          this.updateBoard();
          return;
        }

        this.handleMoveResult(move, from, to);
      });

      return;
    }

    // ⭐ Normal (non-promotion) move
    let move;
    try {
      move = this.chess.move({ from, to }); // <-- FIXED: no forced promotion
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

    this.handleMoveResult(move, from, to);
  }
  showHint() {
    if (this.currentMoveIndex >= this.variationMoves.length) return;

    const san = this.variationMoves[this.currentMoveIndex];
    const moves = this.chess.moves({ verbose: true }) as any[];
    const hintMove = moves.find((m) => m.san === san);

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

      this.onVariationSelect(next);
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
    const currentUser = this.loginService.getCurrentUser();

    if (currentUser) {
      // Logged-in → save first, then show dialog
      this.userProgressService.saveVariationCompletion(this.selectedVariationId).subscribe({
        next: () => {
          // ⭐ Add the completed variation ID to the list
          if (this.selectedVariationId !== null) {
            if (!this.completedVariationIds.includes(this.selectedVariationId)) {
              this.completedVariationIds.push(this.selectedVariationId);
            }
          }
          this.showCompletionDialog();
        },
        error: () => this.showCompletionDialog(),
      });
      return;
    }

    // Not logged in → show dialog first
    this.showCompletionDialogWithSave();
  }
  private showCompletionDialog() {
    const dialogRef = this.dialog.open(VariationCompleteDialog, {
      width: '360px',
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.handleCompletionResult(result);
    });
  }
  private showCompletionDialogWithSave() {
    const dialogRef = this.dialog.open(VariationCompleteDialog, {
      width: '360px',
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.userProgressService.saveVariationCompletion(this.selectedVariationId).subscribe({
        next: () => {
          // ⭐ Add the completed variation ID to the list
          if (this.selectedVariationId !== null) {
            if (!this.completedVariationIds.includes(this.selectedVariationId)) {
              this.completedVariationIds.push(this.selectedVariationId);
            }
          }

          this.handleCompletionResult(result);
        },
        error: (err) => {
          if (err.status === 401) {
            this.openLoginPromptDialog(result);
          } else {
            this.handleCompletionResult(result);
          }
        },
      });
    });
  }

  handleCompletionResult(result: string | null) {
    if (result === 'next') {
      this.loadNextVariation();
    } else {
      this.cancelVariation();
    }
  }
  openLoginPromptDialog(result: string) {
    const dialogRef = this.dialog.open(LoginPromptDialogComponent, {
      width: '320px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((choice) => {
      if (choice === 'login') {
        const returnUrl = this.router.url; // <-- capture current page
        this.router.navigate(['/login'], { queryParams: { returnUrl } });
      } else {
        this.handleCompletionResult(result);
      }
    });
  }

  openPromotionDialog(from: string, to: string) {
    const dialogRef = this.dialog.open(PromotionDialogComponent, {
      width: '300px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((piece: string) => {
      if (!piece) return;

      const move = this.chess.move({ from, to, promotion: piece });

      if (!move) return;

      this.handleMoveResult(move, from, to);
    });
  }

  private isPromotionMove(from: string, to: string): boolean {
    const piece = this.chess.get(from as any);
    if (!piece || piece.type !== 'p') return false;

    const targetRank = to[1];

    return (
      (piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1')
    );
  }
  private completionTimeout: any;
  private handleMoveResult(move: any, from: string, to: string) {
    const expected = this.variationMoves[this.currentMoveIndex];

    console.log('RAW move.san:', move.san);
    console.log('RAW expected:', expected);
    console.log('NORM move.san:', this.normalizeSan(move.san));
    console.log('NORM expected:', this.normalizeSan(expected));
    console.log('currentMoveIndex:', this.currentMoveIndex);

    if (move.san === expected) {
      this.playSound(move.flags.includes('c') ? 'capture' : 'move');

      this.clearShapes('wrong');
      this.clearShapes('yellow');
      this.clearShapes('correct');
      this.clearShapes('blue');
      this.highlightPair(from, to, 'correct');

      this.currentMoveIndex++;

      if (this.currentMoveIndex < this.variationMoves.length) {
        this.autoPlayNextMove();
      }

      this.updateBoard();

      // Delay completion dialog slightly so board can render
      clearTimeout(this.completionTimeout);

      if (this.currentMoveIndex >= this.variationMoves.length) {
        this.openCompletionDialog();
      }

      return;
    }

    this.playSound('wrong');
    this.clearShapes('correct');
    this.clearShapes('wrong');
    this.highlightPair(from, to, 'wrong');

    this.chess.undo();
    this.updateBoard();
  }
}
