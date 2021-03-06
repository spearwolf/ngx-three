// tslint:disable: component-selector component-class-suffix no-redundant-jsdoc deprecation
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  Type,
} from '@angular/core';
import { ConeGeometry } from 'three';
import { ThCylinderGeometry } from './ThCylinderGeometry';
import { ThGeometry } from './ThGeometry';

@Component({
  selector: 'th-coneGeometry',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ThGeometry, useExisting: forwardRef(() => ThConeGeometry) },
  ],
})
export class ThConeGeometry<
  TARGS extends any[] = [
    radius?: number,
    height?: number,
    radialSegments?: number,
    heightSegments?: number,
    openEnded?: boolean,
    thetaStart?: number,
    thetaLength?: number
  ]
> extends ThCylinderGeometry<TARGS> {
  public obj!: ConeGeometry;
  protected getType(): Type<ConeGeometry> {
    return ConeGeometry;
  }

  @Input()
  public set type(value: string) {
    if (this.obj) {
      this.obj.type = value;
    }
  }
}
