import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RecipeService } from 'src/app/recipe.service';
import { Recipe } from '../recipe.modal';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
})
export class RecipeDetailPage implements OnInit, OnDestroy {
  recipeId: string = '';
  recipe: Recipe | undefined;
  // isMyRecipe = false;
  recipes: Recipe[] = [];
  private recipesSub: Subscription = new Subscription();
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private recipeService: RecipeService
  ) {}

  ngOnInit() {
    this.recipesSub = this.recipeService.recipes.subscribe((recipes) => {
      this.recipes = recipes;
      if (this.recipes.length <= 0) {
        this.isLoading = true;
        this.recipeService.fetchRandomRecipes().subscribe(() => {
          this.recipeService.fetchCreatedRecipes().subscribe(() => {
            this.isLoading = false;
          });
        });
        // this.recipeService.getDummyData();
        // this.recipeService.fetchCreatedRecipes().subscribe();
        // this.isLoading = false;
      }

      this.route.paramMap.subscribe((paramMap) => {
        if (!paramMap.has('recipeId')) {
          this.navCtrl.navigateBack('/recipe');
          return;
        }
        this.recipeId = paramMap.get('recipeId')!;
        this.recipe = this.recipeService.getRecipe(this.recipeId);
      });
    });
  }

  onTestBtn() {
    console.log(this.recipe);
  }

  ngOnDestroy() {
    if (this.recipesSub) {
      this.recipesSub.unsubscribe;
    }
  }
}
