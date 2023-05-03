import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecipePage } from './recipe.page';

const routes: Routes = [
  {
    path: '',
    component: RecipePage,
  },
  {
    path: 'recipe-detail/:recipeId',
    loadChildren: () =>
      import('./recipe-detail/recipe-detail.module').then(
        (m) => m.RecipeDetailPageModule
      ),
  },
  {
    path: 'add-recipe',
    loadChildren: () =>
      import('./add-recipe/add-recipe.module').then(
        (m) => m.AddRecipePageModule
      ),
  },
  {
    path: 'edit-recipe/:recipeId',
    loadChildren: () =>
      import('./edit-recipe/edit-recipe.module').then(
        (m) => m.EditRecipePageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipePageRoutingModule {}
