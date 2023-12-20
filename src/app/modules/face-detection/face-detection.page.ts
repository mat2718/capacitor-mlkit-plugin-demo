import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DialogService } from '@app/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import {
  ClassificationMode,
  ContourMode,
  ContourType,
  Face,
  FaceDetection,
  LandmarkMode,
  LandmarkType,
  LensFacing,
  PerformanceMode,
  Point,
} from '@mat2718/capacitor-face-detection';
import { FaceDetectionModalComponent } from './face-detection-modal.component';

@Component({
  selector: 'app-face-detection',
  templateUrl: './face-detection.page.html',
  styleUrls: ['./face-detection.page.scss'],
})
export class FaceDetectionPage implements OnInit {
  public readonly lensFacing = LensFacing;
  public readonly performanceMode = PerformanceMode;
  public readonly contourMode = ContourMode;
  public readonly landmarkMode = LandmarkMode;
  public readonly classificationMode = ClassificationMode;

  public formGroup = new UntypedFormGroup({
    performanceMode: new UntypedFormControl(PerformanceMode.Fast),
    contourMode: new UntypedFormControl(ContourMode.None),
    landmarkMode: new UntypedFormControl(LandmarkMode.None),
    classificationMode: new UntypedFormControl(ClassificationMode.None),
    minFaceSize: new UntypedFormControl(1),
    enableTracking: new UntypedFormControl(false),
    lensFacing: new UntypedFormControl(LensFacing.Back),
  });

  public isSupported = false;
  public isPermissionGranted = false;

  pinFormatter(value: number) {
    return `${value / 10.0}`;
  }

  public faces: Face[] = [];
  public face: Face | undefined;

  private readonly githubUrl =
    'https://github.com/mat2718/capacitor-face-detection';

  constructor(
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    FaceDetection.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    FaceDetection.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
  }

  public async startActiveScan(): Promise<void> {
    const performanceMode = this.formGroup.get('performanceMode')?.value;
    const contourMode = this.formGroup.get('contourMode')?.value;
    const landmarkMode = this.formGroup.get('landmarkMode')?.value;
    const classificationMode = this.formGroup.get('classificationMode')?.value;
    const minFaceSize = this.formGroup.get('minFaceSize')?.value;
    const enableTracking = this.formGroup.get('enableTracking')?.value;
    const lensFacing =
      this.formGroup.get('lensFacing')?.value || LensFacing.Back;
    const element = await this.dialogService.showModal({
      component: FaceDetectionModalComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'face-scanning-modal',
      showBackdrop: false,
      componentProps: {
        performanceMode: performanceMode,
        contourMode: contourMode,
        landmarkMode: landmarkMode,
        classificationMode: classificationMode,
        minFaceSize: minFaceSize / 10.0,
        enableTracking: enableTracking,
        lensFacing: lensFacing,
      },
    });
    element.onDidDismiss().then((result) => {
      const face: Face | undefined = result.data?.face;
      if (face) {
        this.faces = [face];
      }
    });
  }

  public openOnGithub(): void {
    window.open(this.githubUrl, '_blank');
  }

  public async readFaceFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ multiple: false });
    const path = files[0]?.path;
    if (!path) {
      return;
    }

    const performanceMode = this.formGroup.get('performanceMode')?.value;

    const contourMode = this.formGroup.get('contourMode')?.value;
    const landmarkMode = this.formGroup.get('landmarkMode')?.value;

    const classificationMode = this.formGroup.get('classificationMode')?.value;

    const minFaceSize = this.formGroup.get('minFaceSize')?.value;
    const enableTracking = this.formGroup.get('enableTracking')?.value;

    const { faces } = await FaceDetection.readFaceFromImage({
      path: path,
      performanceMode: performanceMode,
      contourMode: contourMode,
      landmarkMode: landmarkMode,
      classificationMode: classificationMode,
      minFaceSize: minFaceSize / 10.0,
      enableTracking: enableTracking,
    });
    this.faces = faces;
  }

  public getLandmarkType(type: LandmarkType) {
    return LandmarkType[type];
  }
  public getContourType(type: ContourType) {
    return ContourType[type];
  }
  public getPoint(point: Point) {
    return `(${point.x}, ${point.y})`;
  }
  public getPoints(points: Point[]) {
    const $ = [];
    for (const point of points) {
      $.push(this.getPoint(point));
    }
    return $.join(', ');
  }

  public async openSettings(): Promise<void> {
    await FaceDetection.openSettings();
  }

  public async requestPermissions(): Promise<void> {
    await FaceDetection.requestPermissions();
  }
}
