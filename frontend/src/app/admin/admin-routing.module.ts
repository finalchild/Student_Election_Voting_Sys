import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdminLoginComponent} from './admin-login.component';
import {AdminResultComponent} from './admin-result.component';
import {
  MatButtonModule, MatCardModule,
  MatDialogModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule,
  MatTableModule, MatToolbarModule
} from '@angular/material';
import {AdminGuardService} from './admin-guard.service';
import {AdminService} from './admin.service';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {InitializeDialogComponent} from './admin-initialize-dialog.component';
import {ListOldPollsDialogComponent} from './admin-list-old-polls-dialog.component';
import {OldPollResultDialogComponent} from './admin-old-poll-result-dialog.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminResultComponent,
    ChangeAdminPasswordDialogComponent,
    CreateStudentKeysDialogComponent,
    InitializeDialogComponent,
    ListOldPollsDialogComponent,
    OldPollResultDialogComponent
  ],
  entryComponents: [
    ChangeAdminPasswordDialogComponent,
    CreateStudentKeysDialogComponent,
    InitializeDialogComponent,
    ListOldPollsDialogComponent,
    OldPollResultDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        children: [
          {path: '', redirectTo: 'login', pathMatch: 'full'},
          {path: 'login', component: AdminLoginComponent},
          {path: 'result', component: AdminResultComponent, canActivate: [AdminGuardService]}
        ]
      }
    ]),
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatTableModule,
    MatListModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AdminService,
    AdminGuardService
  ]
})
export class AdminRoutingModule {
}
