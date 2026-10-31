import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { finalize, map, switchMap } from 'rxjs';
import {
  IParticipant,
  IRevelation,
  SecretSantaTypeEnum,
} from '@features/secret-santa/models/secret-santa.interface';
import { SecretSantaService } from '@features/secret-santa/services/secret-santa.service';

const SHAKE_LAST_FRAME = 2;
const SHAKE_SPEED = 0.4;
const NAME_VISIBLE_FRAME = 21;

@Component({
  selector: 'app-reveal',
  imports: [TranslatePipe],
  templateUrl: './reveal.component.html',
  styleUrl: './reveal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevealComponent implements AfterViewInit, OnDestroy {
  public readonly participant = input.required<IParticipant>();
  public readonly type = input.required<SecretSantaTypeEnum>();
  public readonly secretSantaId = input.required<string>();

  private readonly secretSanta = inject(SecretSantaService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('presentAnimation')
  private readonly presentAnimation!: ElementRef<HTMLCanvasElement>;

  protected readonly revelation = signal<IRevelation | undefined>(undefined);
  protected readonly suggestions = signal<string[] | undefined>(undefined);
  protected readonly animationReady = signal(false);
  protected readonly animationError = signal(false);
  protected readonly isRevealing = signal(false);
  protected readonly SecretSantaTypeEnum = SecretSantaTypeEnum;

  private animation?: DotLottie;
  private isShaking = false;
  private pendingRevelation?: IRevelation;
  private pendingSuggestions?: string[];

  public ngAfterViewInit(): void {
    DotLottie.setWasmUrl('/assets/anim/dotlottie-player.wasm');
    this.animation = new DotLottie({
      canvas: this.presentAnimation.nativeElement,
      src: '/assets/anim/present_opening.lottie',
      autoplay: false,
      loop: false,
    });
    this.animation.addEventListener('load', () => {
      this.startShakeLoop();
      this.animationReady.set(true);
    });
    this.animation.addEventListener('loadError', () => this.animationError.set(true));
    this.animation.addEventListener('frame', ({ currentFrame }) => {
      if (!this.isShaking && currentFrame >= NAME_VISIBLE_FRAME) {
        this.showPendingRevelation();
      }
    });
    this.animation.addEventListener('complete', () => this.showPendingRevelation());
  }

  public ngOnDestroy(): void {
    this.animation?.destroy();
  }

  protected revealSecretSanta(): void {
    if (!this.animation?.isLoaded || this.isRevealing()) {
      return;
    }

    this.isRevealing.set(true);

    this.secretSanta
      .revealSecretSanta(this.participant())
      .pipe(
        switchMap((revelation) =>
          this.secretSanta
            .getRevelationSuggestions(this.secretSantaId(), revelation.name)
            .pipe(map((suggestions) => ({ revelation, suggestions })))
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (!this.pendingRevelation) {
            this.isRevealing.set(false);
          }
        })
      )
      .subscribe(({ revelation, suggestions }) => {
        this.pendingRevelation = revelation;
        this.pendingSuggestions = suggestions;
        this.playOpening();
      });
  }

  private startShakeLoop(): void {
    const animation = this.animation;
    if (!animation) {
      return;
    }

    this.isShaking = true;
    animation.setSegment(0, SHAKE_LAST_FRAME);
    animation.setMode('bounce');
    animation.setLoop(true);
    animation.setSpeed(SHAKE_SPEED);
    animation.play();
  }

  private playOpening(): void {
    const animation = this.animation;
    if (!animation) {
      return;
    }

    this.isShaking = false;
    animation.setLoop(false);
    animation.setSpeed(1);
    animation.setMode('forward');
    animation.resetSegment();
    animation.play();
  }

  private showPendingRevelation(): void {
    const revelation = this.pendingRevelation;
    if (!revelation) {
      return;
    }

    this.pendingRevelation = undefined;
    this.suggestions.set(this.pendingSuggestions);
    this.pendingSuggestions = undefined;
    this.revelation.set(revelation);
    this.isRevealing.set(false);
  }
}
