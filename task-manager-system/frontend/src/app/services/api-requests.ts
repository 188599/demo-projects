import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";

type HttpOptions = Parameters<HttpClient['get']>[1];

export abstract class ApiRequests {

  protected readonly apiUrl = 'http://localhost:5277/api';

  protected readonly http = inject(HttpClient);


  constructor(protected readonly groupName: string) { }


  protected get<T>(endpoint = '', options?: HttpOptions) {
    return this.http.get<T>(this.generateUrl(endpoint), options);
  }

  protected post<T>(body: any, endpoint = '', options?: HttpOptions) {
    return this.http.post<T>(this.generateUrl(endpoint), body, options);
  }

  protected put<T>(body: any, endpoint = '', options?: HttpOptions) {
    return this.http.put<T>(this.generateUrl(endpoint), body, options);
  }

  protected delete<T>(endpoint = '', options?: HttpOptions) {
    return this.http.delete<T>(this.generateUrl(endpoint), options);
  }



  private generateUrl(endpoint: string) {
    return `${this.apiUrl}/${this.groupName}${endpoint ? '/' + endpoint : ''}`;
  }

}
