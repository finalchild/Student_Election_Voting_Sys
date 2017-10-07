import {Component} from '@angular/core';
import {ChoiceService} from './choice.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {MdIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'hc-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  constructor(public choiceService: ChoiceService,
              private router: Router,
              private http: HttpClient,
              iconRegistry: MdIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('account_circle', sanitizer.bypassSecurityTrustResourceUrl('assets/img/account_circle.svg'));
  }

  error: string = undefined;

  onLogin(keyElement: HTMLInputElement, model: NgModel) {
    if (!keyElement.value || keyElement.value === '') {
      model.control.setErrors({
        empty: true
      });
      this.error = '키를 입력해 주세요';
      keyElement.focus();
      return;
    }
    const key = parseInt(keyElement.value, 10);
    if (!isValidKey(key)) {
      model.control.setErrors({
        invalid: true
      });
      this.error = '키는 7자리 이하의 자연수여야 합니다';
      keyElement.focus();
      return;
    }

    this.http.post(`http://localhost:3000/api/login`, {
      key: key,
      candidateCacheId: this.choiceService.candidateNames.candidatesCacheId
    })
      .subscribe(data => {
        this.choiceService.key = key;
        this.choiceService.grade = data['grade'];
        if (data['candidateNames']) {
          this.choiceService.candidateNames = data['candidateNames'];
        }
        this.router.navigate(['/vote']);
      }, err => {
        if (err instanceof HttpErrorResponse) {
          model.control.setErrors({
            couldNotLogin: true
          });
          this.error = JSON.parse(err.error)['message'];
          keyElement.focus();
        } else {
          console.log(err);
        }
      });
  }

}

function isValidKey(key: number): boolean {
  return Number.isSafeInteger(key) && key > 0 && key < 10000000;
}
