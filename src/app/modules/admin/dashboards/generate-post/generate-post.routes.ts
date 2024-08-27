import { Routes } from '@angular/router';
import { EditPostComponent } from './edit-post/edit-post.component';
import { GeneratePostComponent } from './generate-post.component';

export default [
    {
        path: '',
        component: GeneratePostComponent,
        resolve: {},
    },
    {
        path: 'edit',
        component: EditPostComponent,
        resolve: {},
    },
] as Routes;
