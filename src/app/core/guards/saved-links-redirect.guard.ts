import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SavedLinksService } from '@core/services/saved-links.service';

// Sends returning users (with saved events) to their dashboard instead of the landing page
export const savedLinksRedirectGuard: CanActivateFn = () => {
  const hasLinks = inject(SavedLinksService).hasLinks();
  return hasLinks ? inject(Router).createUrlTree(['/my-secret-santas']) : true;
};
