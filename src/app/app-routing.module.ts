import { HomeComponent } from './components/home/home.component';
import { ChooseRepoComponent} from './components/choose-repo/choose-repo.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepoEditorComponent } from 'app/components/repo-editor/repo-editor.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
      path: 'choose-repo',
      component: ChooseRepoComponent
    },
    {
      path: 'repo-editor',
      component: RepoEditorComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
