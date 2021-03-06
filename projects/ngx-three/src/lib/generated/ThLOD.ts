// tslint:disable: component-selector component-class-suffix no-redundant-jsdoc deprecation
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  Type,
} from '@angular/core';
import { LOD, Object3D } from 'three';
import { ThObject3D } from './ThObject3D';

@Component({
  selector: 'th-lOD',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: ThObject3D, useExisting: forwardRef(() => ThLOD) }],
})
export class ThLOD<TARGS extends any[] = []> extends ThObject3D<TARGS> {
  public obj!: LOD;
  protected getType(): Type<LOD> {
    return LOD;
  }

  @Input()
  public set type(value: 'LOD') {
    if (this.obj) {
      this.obj.type = value;
    }
  }

  @Input()
  public set levels(value: { distance: number; object: Object3D }[]) {
    if (this.obj) {
      this.obj.levels = value;
    }
  }

  @Input()
  public set autoUpdate(value: boolean) {
    if (this.obj) {
      this.obj.autoUpdate = value;
    }
  }

  @Input()
  public set objects(value: any[]) {
    if (this.obj) {
      this.obj.objects = value;
    }
  }
}
