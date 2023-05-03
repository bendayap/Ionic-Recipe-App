import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { lastValueFrom, Subscription } from 'rxjs';
import { RecipeService } from 'src/app/recipe.service';
import { Recipe } from '../recipe.modal';

import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
})
export class AddRecipePage implements OnInit, OnDestroy {
  isLoading = false;
  form!: FormGroup;
  dishTypes: string[] = [];
  ingredients: string[] = [];
  recipes: Recipe[] = [];
  private recipesSub = new Subscription();

  selectedFile: any;
  loading: HTMLIonLoadingElement | undefined;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private storage: AngularFireStorage,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.recipesSub = this.recipeService.recipes.subscribe((recipes) => {
      this.recipes = recipes;
    });
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

    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [
          Validators.required,
          Validators.pattern('^(?=.*[a-zA-Z])[a-zA-Z0-9 ]+$'),
        ],
      }),
      dishTypes: new FormControl(null, {
        updateOn: 'blur',
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/[a-zA-Z]/),
        ],
      }),
      image: new FormControl(null),
      ingredients: new FormControl(null, {
        updateOn: 'blur',
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/[a-zA-Z]/),
        ],
      }),
      instructions: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(250)],
      }),
    });
  }

  chooseFile(event: Event) {
    this.selectedFile = (event.target! as HTMLInputElement).files;
    this.form.patchValue({ image: this.selectedFile });
  }

  async uploadFile(id: any, file: string | any[]): Promise<any> {
    if (file && file.length) {
      try {
        const task = await this.storage
          .ref('created-recipes')
          .child(id)
          .put(file[0]);
        return await lastValueFrom(
          this.storage.ref(`created-recipes/${id}`).getDownloadURL()
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    return this.loading.present();
  }

  onCreateRecipe() {
    this.form.value.title = this.form.value.title.trim();
    this.dishTypes = this.form.value.dishTypes
      .split(',')
      .map((dishType: string) => dishType.trim());
    this.dishTypes = this.dishTypes.filter((dishType) => {
      return dishType.match(/[a-zA-Z]/);
    });

    this.ingredients = this.form.value.ingredients
      .split(',')
      .map((ingredient: string) => ingredient.trim());
    this.ingredients = this.ingredients.filter((ingredient) => {
      return ingredient.match(/[a-zA-Z]/);
    });

    this.loadingCtrl
      .create({
        message: 'Creating recipe...',
      })
      .then(async (loadingEl) => {
        loadingEl.present();

        const newRecipe = new Recipe(
          1,
          'Created',
          'created' +
            '-' +
            this.recipes.length.toString() +
            '-' +
            this.form.value.title.split(' ').join('').trim(),
          this.form.value.title,
          this.dishTypes,
          'https://icon-library.com/images/empty-icon/empty-icon-25.jpg',
          this.ingredients,
          this.form.value.instructions
        );
        const imageUrl = await this.uploadFile(newRecipe.id, this.selectedFile);

        this.recipeService.addRecipe(newRecipe, imageUrl).subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/recipe']);
        });
      });
  }

  ngOnDestroy() {
    if (this.recipesSub) {
      this.recipesSub.unsubscribe();
    }
  }
}
