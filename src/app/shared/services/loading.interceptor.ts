import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (request, next) =>
  inject(LoadingService).track(next(request));