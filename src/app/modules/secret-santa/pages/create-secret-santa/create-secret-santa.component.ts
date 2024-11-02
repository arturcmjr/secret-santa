import { Component } from '@angular/core';
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ICreateSecretSanta } from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';
import { minimumArrayLength } from 'src/app/shared/helpers/validators/minimum-array-length.validator';

interface IParticipantSecretSanta {
  name: string;
  secretSanta: string;
}

@Component({
  selector: 'app-create-secret-santa',
  templateUrl: './create-secret-santa.component.html',
  styleUrls: ['./create-secret-santa.component.scss'],
})
export class CreateSecretSantaComponent {
  public isLoading = false;
  public step1group = new UntypedFormGroup({
    name: new UntypedFormControl(null, [Validators.required, Validators.minLength(5)]),
    description: new UntypedFormControl(null),
    date: new UntypedFormControl(null, [Validators.required]),
  });
  protected step2group = new UntypedFormGroup({
    participants: new UntypedFormControl([], [minimumArrayLength(4)]),
  });

  constructor(
    private secretSantaService: SecretSantaService,
    private router: Router,
  ) {}

  public formGroupHasError(
    group: UntypedFormGroup,
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

  public save(): void {
    if (
      this.step1group.invalid ||
      this.step2group.invalid
    ) {
      this.step1group.markAllAsTouched();
      this.step2group.markAllAsTouched();
      return;
    }
    const participants = this.drawSecretSanta();
    const { name, description, date } = this.step1group.value;
    const data: ICreateSecretSanta = {
      name,
      description,
      date,
      participants,
    };
    this.isLoading = true;
    this.secretSantaService.createSecretSanta(data).subscribe((res) => {
      this.isLoading = false;
      this.router.navigate([`/share/${res.id}`]);
    });
  }

  private drawSecretSanta(): IParticipantSecretSanta[] {
    const initialParticipants: string[] = [...this.step2group.value.participants];
    let participants: IParticipantSecretSanta[] = [];
    do {
      participants = [];
      const allParticipants: string[] = [...initialParticipants];
      let options: string[] = [...initialParticipants];
      allParticipants.forEach((entry) => {
        const secretSanta = options[Math.floor(Math.random() * options.length)];
        participants.push({
          name: entry,
          secretSanta,
        });
        options.splice(options.indexOf(secretSanta), 1);
      });
    } while (this.someoneGotHimself(participants));
    return participants;
  }

  public dateFilter: (date: Date | null) => boolean = (date: Date | null) => {
    if (!date) return false;
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );
    return date >= startOfDay && date < oneYearFromNow;
  };

  private someoneGotHimself(participants: IParticipantSecretSanta[]): boolean {
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      if (participant.name === participant.secretSanta) return true;
    }
    return false;
  }
}
