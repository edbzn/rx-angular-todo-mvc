import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { RxStrategyProvider } from '@rx-angular/cdk/render-strategies';
import { RxState } from '@rx-angular/state';
import { select } from '@rx-angular/state/selections';
import { LetModule } from '@rx-angular/template/let';
import { Todo } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, LetModule],
  providers: [RxState],
  template: `
    <article
      class="todo"
      [class]="{ completed: todo.done, editing: isEditing }"
    >
      <div class="view" *ngIf="!isEditing">
        <input
          #toggle
          class="toggle"
          type="checkbox"
          [checked]="todo.done"
          (input)="toggleDone()"
        />
        <label (dblclick)="edit()">{{ todo.text }}</label>
        <button class="destroy" (click)="destroy()"></button>
      </div>
      <input
        #input
        class="edit"
        *ngIf="isEditing"
        [value]="todo.text"
        (blur)="updateText()"
        (keyup.enter)="updateText()"
      />
    </article>
  `,
})
export class TodoComponent {
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  @ViewChild('toggle') toggle?: ElementRef<HTMLInputElement>;

  @Input() set todo(todo: Todo) {
    this.state.set({ todo });
  }

  get todo(): Todo {
    return this.state.get('todo');
  }

  get isEditing(): boolean {
    return this.state.get('isEditing');
  }

  @Output() remove = new EventEmitter<Pick<Todo, 'id'>>();
  @Output() change = new EventEmitter<Todo>();

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly state: RxState<{ isEditing: boolean; todo: Todo }>,
    private readonly strategyProvider: RxStrategyProvider
  ) {
    this.state.set({ isEditing: false });

    const isEditing$ = this.state.$.pipe(
      select('isEditing'),
      this.strategyProvider.scheduleWith((isEditing) => {
        this.cd.detectChanges();

        if (isEditing) {
          this.input!.nativeElement.focus();
        }
      })
    );

    this.state.hold(isEditing$);
  }

  toggleDone(): void {
    this.state.set(({ todo }) => ({
      todo: {
        ...todo,
        done: this.toggle!.nativeElement.checked,
      },
    }));
    this.change.emit(this.todo);
  }

  edit(): void {
    this.state.set({ isEditing: true });
  }

  destroy(): void {
    this.remove.emit(this.todo);
  }

  updateText(): void {
    this.state.set(({ todo }) => ({
      isEditing: false,
      todo: {
        ...todo,
        text: this.input!.nativeElement.value,
      },
    }));
    this.change.emit(this.todo);
  }
}
