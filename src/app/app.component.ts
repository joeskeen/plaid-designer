import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';

const defaultPattern = `0:120
1:108
2:48
1:108
2:300
1:108
2:48
1:108
2:300
1:108
2:48
1:108`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  colors: string[] = ['#23295E', '#d71320', '#1B3519'];
  readonly rowsField = new FormControl(defaultPattern);
  readonly columnsField = new FormControl(defaultPattern);
  readonly twillWidthControl = new FormControl(20);
  readonly sameControl = new FormControl(true);

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  constructor() {
    this.columnsField.valueChanges
      .pipe(filter((_) => this.sameControl.value))
      .subscribe((v) => this.rowsField.patchValue(v));
  }

  ngAfterViewInit() {
    this.generate();
  }

  addColor(color: string) {
    if (!color || this.colors.includes(color)) {
      return;
    }
    this.colors.push(color.toLowerCase().replace(/\s+/g, ''));
  }

  removeColor(color: string) {
    this.colors = this.colors.filter((c) => c !== color);
  }

  generate() {
    const pattern = this.parsePattern(
      this.colors,
      this.twillWidthControl.value,
      this.columnsField.value,
      this.rowsField.value
    );

    this.paintPattern(pattern);
  }

  private paintPattern(pattern: IPattern) {
    const canvas = this.canvas.nativeElement;
    canvas.width = pattern.horizontal.reduce((sum, p) => sum + p.thickness, 0);
    canvas.height = pattern.vertical.reduce((sum, p) => sum + p.thickness, 0);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (
      let col = 0, x = 0, width = pattern.horizontal[col].thickness;
      col < pattern.horizontal.length;
      x += pattern.horizontal[col].thickness,
        col++,
        width = (pattern.horizontal[col] || {}).thickness
    ) {
      for (
        let row = 0, y = 0, height = pattern.vertical[row].thickness;
        row < pattern.vertical.length;
        y += pattern.vertical[row].thickness,
          row++,
          height = (pattern.vertical[row] || {}).thickness
      ) {
        const color = pattern.horizontal[col].color;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        const color2 = pattern.vertical[row].color;
        if (color2 !== color) {
          ctx.fillStyle = color2;
          for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
              if (
                Math.round(((i + j) % (width + height)) / pattern.twillWidth) %
                  2 ===
                0
              ) {
                ctx.fillRect(x + i, y + j, 1, 1);
              }
            }
          }
        }
      }
    }
  }

  private parsePattern(
    colors: string[],
    twillWidth: number,
    horizontalPattern: string,
    verticalPattern: string
  ): IPattern {
    const parse = (str: string) =>
      str
        .split(/\n/g)
        .map((l) => l.trim())
        .map((l) => l.split(':'))
        .map(
          (arr) =>
            ({ color: colors[+arr[0]], thickness: +arr[1] } as IPatternSegment)
        );
    const pattern: IPattern = {
      twillWidth,
      horizontal: parse(horizontalPattern),
      vertical: parse(verticalPattern),
    };
    if (
      pattern.horizontal.find((s) => s.thickness <= 0 || isNaN(s.thickness))
    ) {
      throw new Error('invalid horizontal pattern - invalid thickness');
    }
    if (pattern.vertical.find((s) => s.thickness <= 0 || isNaN(s.thickness))) {
      throw new Error('invalid vertical pattern - invalid thickness');
    }
    return pattern;
  }
}

interface IPattern {
  twillWidth: number;
  horizontal: IPatternSegment[];
  vertical: IPatternSegment[];
}

interface IPatternSegment {
  color: string;
  thickness: number;
}
