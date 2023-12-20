import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { FaceDetectionRoutingModule } from './face-detection-routing.module';

import { FaceDetectionPage } from './face-detection.page';
import { FaceDetectionModalComponent } from './face-detection-modal.component';

@NgModule({
  imports: [SharedModule, FaceDetectionRoutingModule],
  declarations: [FaceDetectionPage, FaceDetectionModalComponent],
})
export class FaceDetectionModule {}
