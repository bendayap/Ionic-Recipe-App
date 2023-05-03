import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { RecipeService } from '../recipe.service';
import { Recipe } from './recipe.modal';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss'],
})
export class RecipePage implements OnInit, OnDestroy, ViewWillEnter {
  loadedRecipes: Recipe[] = [];
  filteredLoadedRecipes: Recipe[] = [];
  isMyRecipe = false;
  isLoading = false;
  private recipesSub = new Subscription();
  private isMyRecipeSub = new Subscription();
  selectedDishTypes: string[] = [];
  dishTypes: any;

  constructor(private recipeService: RecipeService, private http: HttpClient) {
    this.http
      .get('assets/recipetypes.xml', { responseType: 'text' })
      .subscribe((data) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'text/xml');
        const dishTypeNodes = xml.getElementsByTagName('dishType');
        this.dishTypes = Array.from(dishTypeNodes).map((node) =>
          node.textContent!.trim()
        );
      });
  }

  ngOnInit() {
    this.recipesSub = this.recipeService.recipes.subscribe((recipes) => {
      this.loadedRecipes = recipes;
      this.onFilterSelected();
    });

    this.isMyRecipeSub = this.recipeService.isMyRecipe.subscribe(
      (isMyRecipe) => {
        this.isMyRecipe = isMyRecipe;
        this.onFilterSelected();
      }
    );

    if (this.loadedRecipes.length <= 0) {
      this.isLoading = true;
      this.recipeService.fetchRandomRecipes().subscribe(() => {
        this.recipeService.fetchCreatedRecipes().subscribe(() => {
          this.isLoading = false;
        });
      });
    }
    // {
    //   this.recipeService.getDummyData();
    //   this.recipeService.fetchCreatedRecipes().subscribe();
    // }
  }

  ionViewWillEnter() {}

  onTestBtn() {
    console.log(this.dishTypes);
  }

  filterIfIsMyRecipes() {
    if (this.isMyRecipe) {
      this.filteredLoadedRecipes = this.filteredLoadedRecipes.filter(
        (recipe) => {
          return recipe.creation === 'Created';
        }
      );
    }
  }

  onFilterSelected() {
    if (this.selectedDishTypes.length <= 0) {
      this.filteredLoadedRecipes = this.loadedRecipes;
    } else {
      this.filteredLoadedRecipes = this.loadedRecipes.filter((recipe) => {
        return this.selectedDishTypes.every((type) =>
          recipe.dishTypes.includes(type)
        );
      });
    }
    this.filterIfIsMyRecipes();
  }

  clearFilter() {
    this.selectedDishTypes = [];
    this.onFilterSelected();
  }

  ngOnDestroy() {
    if (this.isMyRecipeSub) {
      this.isMyRecipeSub.unsubscribe();
    }
    if (this.recipesSub) {
      this.recipesSub.unsubscribe();
    }
  }
}
