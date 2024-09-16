import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { LayoutComponent } from './components/layout/layout.component';
import { SpinnerOverlayComponent } from './components/spinner-overlay/spinner-overlay.component';
import { DefaultPageLayoutComponent } from './components/default-page-layout/default-page-layout.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MainLogoComponent } from './components/main-logo/main-logo.component';

@NgModule({
  declarations: [
    LayoutComponent,
    SpinnerOverlayComponent,
    DefaultPageLayoutComponent,
    MainLogoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    TranslateModule,
  ],
  exports: [
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerOverlayComponent,
    DefaultPageLayoutComponent,
    TranslateModule,
    MainLogoComponent,
    RouterModule,
  ],
})
export class SharedModule {}
