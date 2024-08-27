import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PostDataService {
    private postDataSubject = new BehaviorSubject<any>(null);
    postData$ = this.postDataSubject.asObservable();

    setPostData(data: any) {
        this.postDataSubject.next(data);
    }

    getPostData() {
        return this.postDataSubject.getValue();
    }

    clearPostData() {
        this.postDataSubject.next(null);
    }
}
