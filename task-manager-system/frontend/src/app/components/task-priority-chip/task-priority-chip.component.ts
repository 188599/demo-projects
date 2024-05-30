import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { TaskPriority } from '../../enums/task-priority';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-priority-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <mat-chip [highlighted]="true" [ngStyle]="{'background-color': color}">{{ displayedText }}</mat-chip>
  `,
  styles: `
    mat-chip {
      pointer-events: none;
    }
  `
})
export class TaskPriorityChipComponent implements OnChanges {

  @Input()
  public priority!: TaskPriority;

  public displayedText!: string;

  public color!: string;


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['priority'].currentValue == changes['priority'].previousValue)
      return;

    this.updateValues();
  }


  private updateValues() {
    switch (this.priority) {
      case TaskPriority.NoPriority:
        this.displayedText = 'No priority', this.color = '#003366';

        break;

      case TaskPriority.LowPriority:
        this.displayedText = 'Low priority', this.color = '#065535';

        break;

      case TaskPriority.MediumPriority:
        this.displayedText = 'Medium priority', this.color = '#daa520';

        break;

      case TaskPriority.HighPriority:
        this.displayedText = 'High priority', this.color = '#b45f06';

        break;

      case TaskPriority.Critical:
        this.displayedText = 'Critical', this.color = '#93000a';

        break;
    }
  }

}
