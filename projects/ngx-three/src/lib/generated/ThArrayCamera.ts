// tslint:disable: component-selector component-class-suffix no-redundant-jsdoc deprecation
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  Type,
} from '@angular/core';
import { ArrayCamera, PerspectiveCamera } from 'three';
import { ThCamera } from './ThCamera';
import { ThObject3D } from './ThObject3D';
import { ThPerspectiveCamera } from './ThPerspectiveCamera';

@Component({
  selector: 'th-arrayCamera',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ThObject3D, useExisting: forwardRef(() => ThArrayCamera) },
    { provide: ThCamera, useExisting: forwardRef(() => ThArrayCamera) },
  ],
})
export class ThArrayCamera<
  TARGS extends any[] = [cameras?: PerspectiveCamera[]]
> extends ThPerspectiveCamera<TARGS> {
  public obj!: ArrayCamera;
  protected getType(): Type<ArrayCamera> {
    return ArrayCamera;
  }

  @Input()
  public set cameras(value: PerspectiveCamera[]) {
    if (this.obj) {
      this.obj.cameras = value;
    }
  }
}
