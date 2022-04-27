import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { minimumArrayLength } from 'src/app/shared/helpers/validators/minimum-array-length.validator';

@Component({
  selector: 'app-create-secret-santa',
  templateUrl: './create-secret-santa.component.html',
  styleUrls: ['./create-secret-santa.component.scss'],
})
export class CreateSecretSantaComponent implements OnInit {
  @ViewChild('participantsScroll') private participantsScroll: ElementRef;

  public basicInfoForm = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    description: new FormControl(null),
    date: new FormControl(null, [Validators.required]),
  });

  public participantsControl = new FormControl([], [minimumArrayLength(4)]);
  public newParticipantControl = new FormControl(null, [
    Validators.minLength(3),
  ]);

  constructor() {}

  ngOnInit(): void {}

  public formGroupHasError(
    group: FormGroup,
    controlName: string,
    error?: string
  ): boolean {
    const control = group.get(controlName);
    if (!control) return false;
    return this.formControlHasError(control, error);
  }

  public formControlHasError(
    control: AbstractControl,
    error?: string
  ): boolean {
    if (!control) return false;
    return (
      (control.touched || control.dirty) &&
      (error ? control.hasError(error) : control.invalid)
    );
  }

  public removeParticipant(index: number): void {
    const participants: string[] = this.participantsControl.value || [];
    participants.splice(index, 1);
    this.participantsControl.setValue(participants);
  }

  public addParticipant(): void {
    if (this.newParticipantControl.invalid || !this.newParticipantControl.value) {
      this.newParticipantControl.markAsTouched();
      return;
    }
    const name = this.newParticipantControl.value;
    const participants: string[] = this.participantsControl.value || [];
    if (participants.includes(name)) {
      this.newParticipantControl.setErrors({ duplicate: true });
      this.newParticipantControl.markAsTouched();
      return;
    } else {
      this.newParticipantControl.setErrors({ duplicate: false });
    }
    participants.push(name);
    this.participantsControl.setValue(participants);
    this.newParticipantControl.reset();
    window.setTimeout(() => {
      this.participantsScroll.nativeElement.scrollTop =
        this.participantsScroll.nativeElement.scrollHeight;
    });
  }
}
