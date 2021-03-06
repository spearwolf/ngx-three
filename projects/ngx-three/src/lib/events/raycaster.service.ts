import { Inject, Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { ThCamera } from '../generated/ThCamera';
import { ThCanvas } from '../ThCanvas';
import { RaycasterEventDirective } from './raycaster.events.directive';

export enum RaycasterEvent {
  mouseEnter = 'mouseEnter',
  mouseExit = 'mouseExit',
  click = 'click',
}

interface NearestIntersection {
  target?: RaycasterEventDirective | null;
  face?: THREE.Face3 | null;
}

@Injectable()
export class RaycasterService implements OnDestroy {
  private canvas?: HTMLCanvasElement;
  private raycaster = new THREE.Raycaster();
  private selected: RaycasterEventDirective | null = null;
  private enabled = true;
  private camera?: ThCamera;
  private groups: Array<RaycasterEventDirective> = [];
  private paused = false;

  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.subscribe();
  }

  public ngOnDestroy(): void {
    this.disable();
    this.unsubscribe();
  }

  private subscribe() {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);
    window.addEventListener('touchstart', this.onTouchStart);
  }

  private unsubscribe() {
    // console.log('unsubscribe raycaster');
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('touchstart', this.onTouchStart);
  }

  public enable() {
    this.enabled = true;
  }

  public disable() {
    this.enabled = false;
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
  }

  get isEnabled() {
    return this.enabled;
  }

  public init(camera: ThCamera, canvas: HTMLCanvasElement) {
    // console.log('Add camera to raycaster', camera);
    this.camera = camera;
    this.canvas = canvas;
  }

  public addEventTarget(target: RaycasterEventDirective) {
    // console.log('RaycasterService.addGroup', group.name, group);
    this.groups.push(target);
  }

  public removeEventTarget(target: RaycasterEventDirective) {
    const index = this.groups.indexOf(target);
    if (index >= 0) {
      this.groups.splice(index, 1);
    }
  }

  private onMouseMove(
    event: any /*MouseEvent  & { layerX: number, layerY: number}*/
  ) {
    if (!this.isReady()) {
      return;
    }
    event.preventDefault();
    const i = this.getFirstIntersectedGroup(event.layerX, event.layerY);
    if (!this.selected || this.selected !== i.target) {
      if (this.selected) {
        this.selected.host.obj.dispatchEvent({
          type: RaycasterEvent.mouseExit,
        });
        this.selected.onMouseExit();
        this.selected = null;
      }
      if (i && i.target) {
        this.selected = i.target;
        const evt = {
          type: RaycasterEvent.mouseEnter,
          face: i.face,
        };
        this.selected.host.obj.dispatchEvent(evt);
        this.selected.onMouseEnter(evt);
      }
    }
  }

  private onClick(
    event: any /*MouseEvent: & { layerX: number, layerY: number}*/
  ) {
    if (!this.isReady(true)) {
      return;
    }
    event.preventDefault();
    const intersection = this.getFirstIntersectedGroup(
      event.layerX,
      event.layerY
    );
    if (intersection && intersection.target) {
      const evt = {
        type: RaycasterEvent.click,
        face: intersection.face,
      };
      intersection.target.host.obj.dispatchEvent(evt);
      intersection.target.onClick(evt);
    }
  }

  private onTouchStart(event: TouchEvent) {
    // console.log(event);
    if (!this.isReady()) {
      return;
    }
    event.preventDefault();
    const i = this.getFirstIntersectedGroup(
      event.touches[0].clientX,
      event.touches[0].clientY
    );
    if (i && i.target) {
      const evt = { type: RaycasterEvent.click, face: i.face };
      i.target.host.obj.dispatchEvent(evt);
      i.target.onClick(evt);
    }
  }

  private isReady(ignorePaused?: boolean): boolean {
    return !!(
      this.enabled &&
      (ignorePaused || !this.paused) &&
      this.camera &&
      this.camera.obj &&
      this.groups &&
      this.groups.length > 0
    );
  }

  private getFirstIntersectedGroup(x: number, y: number): NearestIntersection {
    if (!this.camera || !this.canvas) {
      return { face: null, target: null };
    }
    x = (x / this.canvas.clientWidth) * 2 - 1;
    y = -(y / this.canvas.clientHeight) * 2 + 1;
    const mouseVector = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(mouseVector, this.camera.obj);
    let face = null;

    // loop across all groups. Try to find the group with nearest distance.
    let nearestIntersection: THREE.Intersection | undefined;
    let nearestGroup: RaycasterEventDirective | undefined;
    for (const group of this.groups) {
      const i = group.host.obj;
      const intersection = this.raycaster.intersectObject(i, true);
      if (
        intersection.length > 0 &&
        (!nearestIntersection ||
          nearestIntersection.distance > intersection[0].distance)
      ) {
        nearestIntersection = intersection[0];
        face = nearestIntersection.face;
        nearestGroup = group;
      }
    }

    // return the group with nearest distance
    if (nearestGroup) {
      return {
        target: nearestGroup,
        face,
      };
    } else {
      return {
        target: null,
        face: null,
      };
    }
  }
}
