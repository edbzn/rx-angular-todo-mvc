import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <footer>
      <strong>Fully zoneless Angular app</strong> using
      <code>
        <a
          href="https://github.com/rx-angular/rx-angular/blob/master/libs/state/README.md"
        >
          &#64;rx-angular/state</a
        >
      </code>
      to manage state and
      <code>
        <a
          href="https://github.com/rx-angular/rx-angular/blob/master/libs/template/README.md"
          >&#64;rx-angular/template</a
        ></code
      >
      to detect changes.
    </footer>
  `,
}) export class FooterComponent {}
