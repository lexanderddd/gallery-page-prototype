import {inject, Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {first, takeUntil} from 'rxjs/operators';

import {Router} from '@angular/router';
import {LoadingIndicator} from "./loading-indicator";

/**
 * Обёртка над подписками.
 * Не наше творчество, позаимствовали.
 */
@Injectable({providedIn: 'root'})
export class SubscribeHandlerService {
  private router = inject(Router);

  /**
   *  Выполняет запрос/ы.
   * @param request Запрос/ы.
   * @param dataFn Метод, который обрабатывает полученные данные.
   * @param loading Индикатор загрузки.
   * @param skipNotFound Флаг, который определяет возможность редиректа по 404 ошибке.
   */
  takeOne<T>(request: Observable<T>, dataFn: (data: T) => void, loading = new LoadingIndicator(), skipNotFound = true): void {
    loading.isLoading = true;
    request.pipe(first()).subscribe({
      next: dataFn,
      error: err => {
        loading.isLoading = false;
        if (err.status === 404 && !skipNotFound) {
          this.router.navigate(['/404'], {skipLocationChange: true}).then();
        }
      },
      complete: () => loading.isLoading = false
    });
  }

  /**
   * Подписывается на subject (asObservable).
   * @param observable Subject (asObservable).
   * @param dataFn Метод, который обрабатывает полученные данные.
   * @param subject Отписывается по событию.
   */
  subjectSubscribe<T>(observable: Observable<T>, dataFn: (data: T) => void, subject: Subject<void>): void {
    observable.pipe(takeUntil(subject)).subscribe({next: dataFn});
  }
}
