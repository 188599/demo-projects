import { Injector } from "@angular/core";
import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";
import { map, switchMap, timer } from "rxjs";
import { AuthService } from "../services/auth.service";

export class AppValidators {

    public static confirmPassword(controlNameToCompare: string): ValidatorFn {
        return ctrl => ctrl.value !== ctrl.parent?.get(controlNameToCompare)?.value ? { noMatch: true } : null;
    }

}

export class AppAsyncValidators {

    public static uniqueUsername(injector: Injector): AsyncValidatorFn {
        return ctrl =>
            timer(500).pipe(
                switchMap(_ => injector.get(AuthService).isUsernameValid(ctrl.value)),
                map(({ validUsername }) => validUsername ? null : ({ usernameInUse: true }))
            );
    }

}