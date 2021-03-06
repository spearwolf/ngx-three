// tslint:disable: component-selector component-class-suffix no-redundant-jsdoc deprecation
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  Type,
} from '@angular/core';
import { AudioListener, PositionalAudio } from 'three';
import { ThAudio } from './ThAudio';
import { ThObject3D } from './ThObject3D';

@Component({
  selector: 'th-positionalAudio',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ThObject3D, useExisting: forwardRef(() => ThPositionalAudio) },
  ],
})
export class ThPositionalAudio<
  TARGS extends any[] = [listener: AudioListener]
> extends ThAudio<PannerNode, TARGS> {
  public obj!: PositionalAudio;
  protected getType(): Type<PositionalAudio> {
    return PositionalAudio;
  }

  @Input()
  public set panner(value: PannerNode) {
    if (this.obj) {
      this.obj.panner = value;
    }
  }
}
