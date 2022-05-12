import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { LayoutComponent } from './components/layout/layout.component';
import { SpinnerOverlayComponent } from './components/spinner-overlay/spinner-overlay.component';

@NgModule({
  declarations: [LayoutComponent, SpinnerOverlayComponent],
  imports: [RouterModule, AngularMaterialModule],
  exports: [AngularMaterialModule, FormsModule, ReactiveFormsModule, FlexLayoutModule, SpinnerOverlayComponent ],
})
export class SharedModule {}
