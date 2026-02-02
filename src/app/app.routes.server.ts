import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'openings/:name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { name: 'Vienna Gambit' },
        { name: 'Vienna Gambit Mastery' },
        { name: 'Vienna Game' },
        { name: 'Counter the Vienna Gambit' },
        { name: 'Fried Liver Attack' },
        { name: 'Fried Liver Attack Mastery' },
        { name: 'Traxler Counterattack' },
        { name: 'Traxler Counterattack Mastery' },
        { name: "Bishop's Opening" },
        { name: 'Italian Game' },
        { name: 'Stafford Gambit' },
        { name: 'Stafford Gambit Mastery' },
        { name: "King's Gambit" },
        { name: 'Danish Gambit' },
        { name: 'Englund Gambit' },
        { name: 'Rousseau Gambit' },
        { name: 'Albin Countergambit' },
        { name: 'Ruy Lopez' },
        { name: 'Scotch Game' },
        { name: 'Ponziani' },
        { name: 'Petrov Defense' },
        { name: 'Caro-Kann' },
        { name: 'Sicilian Defense' },
        { name: 'Alapin Sicilian' },
        { name: 'French Defense' },
        { name: "Queen's Gambit Accepted" },
        { name: "Queen's Gambit Declined" },
        { name: 'Jobava London' },
        { name: 'London' },
        { name: 'English' },
        { name: 'The Dojo' },
      ];
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
