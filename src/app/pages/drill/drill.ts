import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OpeningsService } from '../../services/openings.service';
import { EvaluationBarComponent } from '../evaluation-bar/evaluation-bar';
import { Opening } from '../../models/openings';
import { DrillVariation } from '../../models/drillvariation';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog';
import { LeaderboardPanelComponent } from '../leaderboard-panel/leaderboard-panel';
import { LeaderboardService } from '../../services/leaderboard.service';
import { LeaderboardStateService } from '../../services/LeaderboardStateService';
import { StockfishService } from '../../services/stockfish-service';
@Component({
  selector: 'app-drill-page',
  standalone: true,
  imports: [CommonModule, FeedbackDialogComponent, LeaderboardPanelComponent],
  templateUrl: './drill.html',
  styleUrls: ['./drill.css'],
})
export class DrillPageComponent implements OnInit {
  variations: DrillVariation[] = [];
  board: any;
  currentVariation: any = null;
  boardReady: boolean = false;

  currentMoveIndex: number = 0;
  currentIndex = 0;
  currentFen = '';
  nextMoveText = '';

  openingName = '';
  isRandom = false;
  chess = new Chess();
  evalCp: number | null = null;
  evalMate: number | null = null;
  orientation: 'white' | 'black' = 'white';
  successDrillCount = 0;
  popupMessage = '';
  popupType: 'right' | 'wrong' = 'right';
  showPopup = false;
  currentStreak = 0;
  dailyStreak = 0; // fetched from backend
  allTimeStreak = 0; // fetched from backend
  openingId!: number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private openingsService: OpeningsService,
    private leaderboardState: LeaderboardStateService,
    private leaderboardService: LeaderboardService,
    private stockfish: StockfishService,
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');

    if (param === 'random') {
      this.isRandom = true;
      this.openingId = 0; // special numeric ID for random drill
      this.loadRandomDrill();
    } else {
      this.isRandom = false;
      this.openingId = Number(param); // always a number
      this.loadOpeningDrill(this.openingId);
    }

    // Always safe now — openingId is guaranteed to be a number
    this.leaderboardState.refresh(this.openingId);
  }

  ngAfterViewInit() {
    const element = document.getElementById('board');
    if (!element) return;

    this.board = Chessground(element, {
      fen: this.currentFen,
      orientation: this.orientation,
      movable: {
        free: true,
        color: 'both',
        events: {
          after: (from: string, to: string) => this.onMoveFromBoard(from, to),
        },
      },
      highlight: { lastMove: true, check: true },
      animation: { enabled: true },
    });

    this.boardReady = true;
  }

  /* -----------------------------------
        LOAD VARIATIONS
  ------------------------------------ */

  loadRandomDrill() {
    this.openingsService.getAllWithVariation().subscribe((data: Opening[]) => {
      this.variations = data.flatMap((o) =>
        o.variations.map((v) => ({
          id: v.id,
          name: v.name,
          moves: this.parseMoves(v.moves),
          openingId: o.id,
          openingName: o.name,
          openingEco: o.eco,
          openingSide: o.side,
          openingDescription: o.description,
        })),
      );

      this.startDrill();
    });
  }

  loadOpeningDrill(openingId: number) {
    this.openingsService.getById(openingId).subscribe((o: Opening) => {
      this.variations = o.variations.map((v) => ({
        id: v.id,
        name: v.name,
        moves: this.parseMoves(v.moves),
        openingId: o.id,
        openingName: o.name,
        openingEco: o.eco,
        openingSide: o.side,
        openingDescription: o.description,
      }));

      this.startDrill();
    });
  }
  private shuffleArray<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
  /* -----------------------------------
        DRILL FLOW
  ------------------------------------ */

  startDrill() {
    this.variations = this.shuffleArray(this.variations);

    this.loadVariation();
  }

  loadVariation() {
    this.currentVariation = this.variations[this.currentIndex];
    this.currentMoveIndex = 0;

    this.orientation =
      this.currentVariation.openingSide?.toLowerCase().trim() === 'black' ? 'black' : 'white';

    this.chess.reset();

    // If user is Black → auto-play White's first move
    if (this.orientation === 'black') {
      this.autoPlayWhiteMoves();
    }

    this.currentFen = this.chess.fen();
    this.updateBoard();

    this.nextMoveText = 'Your move…';
  }
  private updateBoard() {
    if (!this.board) return;

    this.board.set({
      fen: this.currentFen,
      orientation: this.orientation,
    });
  }
  async onMoveFromBoard(from: string, to: string) {
    const move = `${from}${to}`;

    // ❗ Call validateMove on the SERVICE, not the worker
    const legal = await this.stockfish.validateMove(this.currentFen, move);
    if (!legal) {
      this.playSound('wrong');
      this.highlightSquare(from, 'wrong');
      this.updateBoard(); // snap back
      return;
    }

    // Apply move using chess.js
    const result = this.chess.move({ from, to, promotion: 'q' });

    if (!result) {
      // fallback (should never happen now)
      this.playSound('wrong');
      this.highlightSquare(from, 'wrong');
      this.updateBoard();
      return;
    }

    const san = result.san;

    // Sounds
    if (san.includes('x')) this.playSound('capture');
    else if (san.includes('+') || san.includes('#')) this.playSound('check');
    else this.playSound('move');

    // Highlight
    this.highlightSquare(to, 'correct');

    // Drill logic
    this.onMove(san);

    // Update FEN + board
    this.currentFen = this.chess.fen();
    this.updateBoard();
  }
  /* -----------------------------------
        MOVE VALIDATION
  ------------------------------------ */

  onMove(san: string) {
    const expected = this.currentVariation.moves[this.currentMoveIndex];

    // CORRECT MOVE
    if (san === expected) {
      this.currentMoveIndex++;
      this.showRight('Correct!');

      // Auto-play opponent
      if (this.orientation === 'black') {
        this.autoPlayWhiteMoves();
      } else {
        this.autoPlayBlackMoves();
      }

      // VARIATION COMPLETE
      if (this.currentMoveIndex >= this.currentVariation.moves.length) {
        this.currentStreak++;

        this.showRight('Variation Complete!');
        const isNewRecord =
          this.currentStreak > this.dailyStreak || this.currentStreak > this.allTimeStreak;

        if (isNewRecord) {
          this.leaderboardService.updateStreak(this.openingId, this.currentStreak).subscribe(() => {
            this.leaderboardState.refresh(this.openingId);
          });
        }

        setTimeout(() => {
          this.currentIndex = (this.currentIndex + 1) % this.variations.length;
          this.loadVariation();
        }, 900);

        return;
      }

      return;
    }

    // WRONG MOVE
    this.showWrong('Wrong Move!');
    this.playSound('wrong');
    this.shakeBoard();
    // Drill attempt finished → increment score
    // Check daily streak
    if (this.currentStreak > this.dailyStreak || this.currentStreak > this.allTimeStreak) {
      this.leaderboardService.updateStreak(this.openingId, this.currentStreak).subscribe(() => {
        this.leaderboardState.refresh(this.openingId);
      });
    }

    // Reset streak
    this.currentStreak = 0;

    // Reset variation
    this.currentMoveIndex = 0;
    this.currentIndex = 0;
    this.startDrill();

    setTimeout(() => this.loadVariation(), 900);
  }

  goToNextVariation() {
    setTimeout(() => {
      if (this.currentIndex < this.variations.length - 1) {
        this.currentIndex++;
        this.loadVariation();
      } else {
        this.nextMoveText = 'Drill complete!';
      }
    }, 800);
  }

  /* -----------------------------------
        UTILITIES
  ------------------------------------ */

  goBack() {
    this.router.navigate(['/openings']);
  }

  private parseMoves(pgn: string): string[] {
    return pgn
      .replace(/\d+\./g, '') // remove move numbers like "1." "2." "12."
      .trim()
      .split(/\s+/); // split into SAN tokens
  }

  autoPlayWhiteMoves() {
    while (this.currentMoveIndex < this.currentVariation.moves.length) {
      const san = this.currentVariation.moves[this.currentMoveIndex];

      if (this.chess.turn() === 'w') {
        const move = this.chess.move(san);

        // sound
        if (san.includes('x')) this.playSound('capture');
        else if (san.includes('+') || san.includes('#')) this.playSound('check');
        else this.playSound('move');

        // highlight
        this.highlightSquare(move.to, 'correct');

        this.currentMoveIndex++;
      } else {
        break;
      }
    }

    this.currentFen = this.chess.fen();
    this.updateBoard();
  }

  playSound(type: 'move' | 'capture' | 'wrong' | 'check') {
    const audio = new Audio(`assets/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play();
  }
  autoPlayBlackMoves() {
    while (this.currentMoveIndex < this.currentVariation.moves.length) {
      const san = this.currentVariation.moves[this.currentMoveIndex];

      if (this.chess.turn() === 'b') {
        const move = this.chess.move(san);

        // sound
        if (san.includes('x')) this.playSound('capture');
        else if (san.includes('+') || san.includes('#')) this.playSound('check');
        else this.playSound('move');

        // highlight
        this.highlightSquare(move.to, 'correct');

        this.currentMoveIndex++;
      } else {
        break;
      }
    }

    this.currentFen = this.chess.fen();
    this.updateBoard();
  }
  highlightSquare(square: string, type: 'correct' | 'wrong') {
    const el = document.querySelector(`.cg-square[data-square="${square}"]`);
    if (!el) return;

    el.classList.add(type === 'correct' ? 'square-correct' : 'square-wrong');

    setTimeout(() => {
      el.classList.remove('square-correct', 'square-wrong');
    }, 400);
  }
  shakeBoard() {
    const el = document.getElementById('board');
    if (!el) return;

    el.classList.add('board-shake');
    setTimeout(() => el.classList.remove('board-shake'), 300);
  }

  showRight(msg: string = 'Correct!') {
    this.popupMessage = msg;
    this.popupType = 'right';
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 900);
  }

  showWrong(msg: string = 'Wrong!') {
    this.popupMessage = msg;
    this.popupType = 'wrong';
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 900);
  }
}
