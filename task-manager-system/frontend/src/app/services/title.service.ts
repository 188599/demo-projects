import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleService {

  private titleSig = signal<string | null>(null);

  
  constructor() { }
  
  public get title() {
    return this.titleSig.asReadonly();
  }

  public setTitle(title: string | null) {
    this.titleSig.set(title);
  }

}
