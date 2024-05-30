import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";

type HttpOptions = Parameters<HttpClient['get']>[1];

export class ApiRequestsService {

  protected readonly apiUrl = 'http://localhost:5277/api';

  protected readonly http = inject(HttpClient);


  constructor(protected readonly groupName: string) { }


  protected get<T>(endpoint: string, options?: HttpOptions) {
    return this.http.get<T>(`${this.apiUrl}/${this.groupName}/${endpoint}`, options);
  }

  protected post<T>(endpoint: string, body: any, options?: HttpOptions) {
    return this.http.post<T>(`${this.apiUrl}/${this.groupName}/${endpoint}`, body, options);
  }

}
