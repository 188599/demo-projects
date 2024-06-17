import { inject } from "@angular/core";
import { TitleService } from "../services/title.service";
import { NEVER } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export abstract class Page {

    constructor(title: string | null) {
        const titleService = inject(TitleService);

        titleService.setTitle(title);

        NEVER
            .pipe(takeUntilDestroyed())
            // on components destroy remove title
            .subscribe({ complete: () => titleService.setTitle(null) });
    }

}