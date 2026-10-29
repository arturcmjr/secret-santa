import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DefaultPageLayoutComponent } from '@shared/components/default-page-layout/default-page-layout.component';
import { ListInputComponent } from '@shared/components/list-input/list-input.component';
import { SpinnerOverlayComponent } from '@shared/components/spinner-overlay/spinner-overlay.component';
import { minimumArrayLength } from '@shared/helpers/validators/minimum-array-length.validator';
import { MatFormErrorDirective } from '@shared/services/directives/mat-form-error.directive';
import {
  ICreateSecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

interface IParticipantSecretSanta {
  name: string;
  secretSanta: string;
}

interface IConfirmationSummary {
  name: string;
  description: string;
  date: Date;
  participants: string[];
  useSuggestion: boolean;
  maxSuggestions?: number;
}

@Component({
  selector: 'app-create-secret-santa',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    CdkTextareaAutosize,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatError,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
    MatSlideToggle,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatSuffix,
    MatTooltip,
    TranslatePipe,
    DefaultPageLayoutComponent,
    ListInputComponent,
    SpinnerOverlayComponent,
    MatFormErrorDirective,
  ],
  templateUrl: './create-secret-santa.component.html',
  styleUrl: './create-secret-santa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSecretSantaComponent {
  private readonly secretSantaService = inject(SecretSantaService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly confirmationSummary = signal<IConfirmationSummary | undefined>(undefined);

  protected readonly step1group = new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(5),
    ]),
    description: new FormControl<string | null>(null),
    date: new FormControl<Date | null>(null, [Validators.required]),
    useSuggestion: new FormControl(false, { nonNullable: true }),
    maxSuggestions: new FormControl<number | null>(
      { value: null, disabled: true },
      [Validators.required, Validators.min(1)]
    ),
  });
  protected readonly step2group = new FormGroup({
    participants: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [minimumArrayLength(4)],
    }),
  });

  protected readonly useSuggestion = toSignal(
    this.step1group.controls.useSuggestion.valueChanges,
    { initialValue: this.step1group.controls.useSuggestion.value }
  );

  constructor() {
    this.step1group.controls.useSuggestion.valueChanges.subscribe((value) => {
      const { maxSuggestions } = this.step1group.controls;
      if (value) maxSuggestions.enable();
      else maxSuggestions.disable();
    });
  }

  protected readonly dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );
    return date >= startOfDay && date < oneYearFromNow;
  };

  protected save(): void {
    if (this.step1group.invalid || this.step2group.invalid) {
      this.step1group.markAllAsTouched();
      this.step2group.markAllAsTouched();
      return;
    }
    const participants = this.drawSecretSanta();
    const { name, description, date, useSuggestion, maxSuggestions } =
      this.step1group.getRawValue();
    const data: ICreateSecretSanta = {
      name: name!,
      description: description ?? '',
      date: date!,
      participants,
      maxSuggestions: useSuggestion ? maxSuggestions ?? undefined : undefined,
      type: useSuggestion
        ? SecretSantaTypeEnum.Suggestions
        : SecretSantaTypeEnum.Default,
    };
    this.isLoading.set(true);
    this.secretSantaService.createSecretSanta(data).subscribe((res) => {
      this.isLoading.set(false);
      this.router.navigate([`/share/${res.id}`]);
    });
  }

  protected onParticipantsNext(): void {
    const participantsControl = this.step2group.controls.participants;
    if (participantsControl.invalid) {
      participantsControl.markAsTouched();
      return;
    }
    const { name, description, date, useSuggestion, maxSuggestions } =
      this.step1group.getRawValue();
    this.confirmationSummary.set({
      name: name!,
      description: description ?? '',
      date: date!,
      participants: participantsControl.value,
      useSuggestion,
      maxSuggestions: useSuggestion ? maxSuggestions ?? undefined : undefined,
    });
  }

  private drawSecretSanta(): IParticipantSecretSanta[] {
    const initialParticipants = [...this.step2group.controls.participants.value];
    let participants: IParticipantSecretSanta[] = [];
    do {
      participants = [];
      const options = [...initialParticipants];
      initialParticipants.forEach((name) => {
        const secretSanta = options[Math.floor(Math.random() * options.length)];
        participants.push({ name, secretSanta });
        options.splice(options.indexOf(secretSanta), 1);
      });
    } while (this.someoneGotHimself(participants));
    return participants;
  }

  private someoneGotHimself(participants: IParticipantSecretSanta[]): boolean {
    return participants.some(
      (participant) => participant.name === participant.secretSanta
    );
  }
}
