import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  host: { class: 'flex min-h-dvh flex-col' },
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
