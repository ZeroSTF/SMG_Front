import { Routes } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { SettingsComponent } from 'app/modules/admin/pages/settings/settings.component';

export default [
    {
        path: '',
        component: SettingsComponent,
    },
] as Routes;
