import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DialogService } from '@app/core';
import { LensFacing } from '@capacitor-mlkit/barcode-scanning';
import {
  ClassificationMode,
  ContourMode,
  Face,
  FaceDetection,
  LandmarkMode,
  PerformanceMode,
  StartActiveScanOptions,
} from '@mat2718/capacitor-face-detection';

@Component({
  selector: 'app-face-detection',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Scanning Yo Face!!!!</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div #square class="square">
        <p>Place your face in the square</p>
      </div>
      <ion-fab
        *ngIf="isTorchAvailable"
        slot="fixed"
        horizontal="end"
        vertical="bottom"
      >
        <ion-fab-button (click)="toggleTorch()">
          <ion-icon name="flashlight"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: transparent;
      }

      .square {
        position: absolute;
        text-align: center;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 16px;
        width: 200px;
        height: 200px;
        border: 6px solid yellow;
        box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
      }
    `,
  ],
})
export class FaceDetectionModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input()
  public performanceMode: PerformanceMode = PerformanceMode.Fast;
  @Input()
  public contourMode: ContourMode = ContourMode.None;
  @Input()
  public landmarkMode: LandmarkMode = LandmarkMode.None;
  @Input()
  public classificationMode: ClassificationMode = ClassificationMode.None;
  @Input()
  public minFaceSize = 1;
  @Input()
  public enableTracking = false;
  @Input()
  public lensFacing: LensFacing = LensFacing.Back;

  @ViewChild('square')
  public squareElement: ElementRef<HTMLDivElement> | undefined;

  public isTorchAvailable = false;

  constructor(
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    FaceDetection.isTorchAvailable().then((result) => {
      this.isTorchAvailable = result.available;
    });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.startActiveScan();
    }, 250);
  }

  public ngOnDestroy(): void {
    this.stopScan();
  }

  public async closeModal(face?: Face): Promise<void> {
    this.dialogService.dismissModal({
      face: face,
    });
  }

  public async toggleTorch(): Promise<void> {
    await FaceDetection.toggleTorch();
  }

  private async startActiveScan(): Promise<void> {
    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('face-scanning-active');

    const options: StartActiveScanOptions = {
      performanceMode: this.performanceMode,
      contourMode: this.contourMode,
      landmarkMode: this.landmarkMode,
      classificationMode: this.classificationMode,
      minFaceSize: this.minFaceSize,
      enableTracking: this.enableTracking,
      lensFacing: this.lensFacing,
    };

    const squareElementBoundingClientRect =
      this.squareElement?.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect
      ? {
          left: squareElementBoundingClientRect.left * window.devicePixelRatio,
          right:
            squareElementBoundingClientRect.right * window.devicePixelRatio,
          top: squareElementBoundingClientRect.top * window.devicePixelRatio,
          bottom:
            squareElementBoundingClientRect.bottom * window.devicePixelRatio,
          width:
            squareElementBoundingClientRect.width * window.devicePixelRatio,
          height:
            squareElementBoundingClientRect.height * window.devicePixelRatio,
        }
      : undefined;
    const detectionCornerPoints = scaledRect
      ? [
          [scaledRect.left, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top],
          [
            scaledRect.left + scaledRect.width,
            scaledRect.top + scaledRect.height,
          ],
          [scaledRect.left, scaledRect.top + scaledRect.height],
        ]
      : undefined;
    const listener = await FaceDetection.addListener(
      'faceScanned',
      async (event) => {
        this.ngZone.run(() => {
          console.log('faceScanned', event.face);
          // const cornerPoints = event.face.cornerPoints;
          // if (detectionCornerPoints && cornerPoints) {
          //   if (
          //     detectionCornerPoints[0][0] > cornerPoints[0][0] ||
          //     detectionCornerPoints[0][1] > cornerPoints[0][1] ||
          //     detectionCornerPoints[1][0] < cornerPoints[1][0] ||
          //     detectionCornerPoints[1][1] > cornerPoints[1][1] ||
          //     detectionCornerPoints[2][0] < cornerPoints[2][0] ||
          //     detectionCornerPoints[2][1] < cornerPoints[2][1] ||
          //     detectionCornerPoints[3][0] > cornerPoints[3][0] ||
          //     detectionCornerPoints[3][1] < cornerPoints[3][1]
          //   ) {
          //     return;
          //   }
          // }
          listener.remove();
          this.closeModal(event.face);
        });
      }
    );
    await FaceDetection.startActiveScan(options);
  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('face-scanning-active');

    await FaceDetection.stopScan();
  }
}
